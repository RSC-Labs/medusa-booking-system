import { BookingResourceAvailabilityRuleType, BookingResourceType, BookingResourceAllocationType } from "../types/booking";

type TimeRange = {
  start: Date
  end: Date
}

export type AvailabilityLayer = {
  source_type: 'base' | 'availability_rule' | 'allocation'
  source_id?: string
  source_name?: string
  effect: 'grant' | 'block'
  priority: number
  time_range: { start: Date; end: Date }
  metadata?: {
    allocation_type?: 'hold' | 'booked'
    allocation_expires_at?: Date
    [key: string]: any
  }
}

export interface BookingAvailabilitySlot {
  start: Date
  end: Date
  available: boolean
  layers: AvailabilityLayer[]
  effective_layer?: AvailabilityLayer
}

export interface BookingAvailability {
  date: Date
  is_available: boolean
  view: "month" | "week" | "day"
  slots: BookingAvailabilitySlot[]
  layers?: AvailabilityLayer[],
  effective_layer?: AvailabilityLayer
}

export type SlotResolution =
  | { unit: "minute"; value: number }
  | { unit: "hour"; value: number }
  | { unit: "day"; value: number }

function intersectRanges(
  base: TimeRange[],
  overlays: TimeRange[]
): TimeRange[] {
  const result: TimeRange[] = []

  for (const b of base) {
    for (const o of overlays) {
      const start = new Date(Math.max(b.start.getTime(), o.start.getTime()))
      const end = new Date(Math.min(b.end.getTime(), o.end.getTime()))

      if (start < end) {
        result.push({ start, end })
      }
    }
  }

  return result
}

function subtractRanges(
  base: TimeRange[],
  blockers: TimeRange[]
): TimeRange[] {
  let result = [...base]

  for (const block of blockers) {
    const temp: TimeRange[] = []

    for (const range of result) {
      // No overlap
      if (block.end <= range.start || block.start >= range.end) {
        temp.push(range)
        continue
      }

      // Left remainder
      if (block.start > range.start) {
        temp.push({
          start: range.start,
          end: block.start,
        })
      }

      // Right remainder
      if (block.end < range.end) {
        temp.push({
          start: block.end,
          end: range.end,
        })
      }
    }

    result = temp
  }

  return result
}

function resolutionToMs(res: SlotResolution): number {
  const map = {
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
  }
  return map[res.unit] * res.value
}

function computeAvailabilityFromLayers(
  layers: AvailabilityLayer[],
  startDate: Date,
  endDate: Date
): TimeRange[] {
  const sorted = [...layers].sort((a, b) => a.priority - b.priority)
  
  let available: TimeRange[] = []
  
  for (const layer of sorted) {
    if (layer.effect === 'grant') {
      if (available.length === 0) {
        available = [layer.time_range]
      } else {
        available = intersectRanges(available, [layer.time_range])
      }
    } else if (layer.effect === 'block') {
      available = subtractRanges(available, [layer.time_range])
    }
  }
  
  return available
}

function generateSlotsWithAttribution(
  ranges: TimeRange[],
  layers: AvailabilityLayer[],
  startDate: Date,
  endDate: Date,
  resolution: SlotResolution
): BookingAvailabilitySlot[] {
  const slots: BookingAvailabilitySlot[] = []
  const durationMs = resolutionToMs(resolution)
  let cursor = startDate.getTime()
  
  while (cursor + durationMs <= endDate.getTime()) {
    const slotStart = new Date(cursor)
    const slotEnd = new Date(cursor + durationMs)
    
    const isAvailable = ranges.some(r => 
      r.start <= slotStart && r.end >= slotEnd
    )
    
    const affectingLayers = layers.filter(layer => 
      layer.time_range.start < slotEnd && 
      layer.time_range.end > slotStart
    ).sort((a, b) => b.priority - a.priority)
    
    const effectiveLayer = isAvailable
    ? affectingLayers.find(l => l.effect === 'grant')
    : affectingLayers.find(l => l.effect === 'block')
    
    slots.push({
      start: slotStart,
      end: slotEnd,
      available: isAvailable,
      layers: affectingLayers,
      effective_layer: effectiveLayer
    })
    
    cursor += durationMs
  }
  
  return slots
}

function groupSlotsByDay(
  slots: BookingAvailabilitySlot[]
): BookingAvailability[] {
  const map = new Map<string, BookingAvailability>()

  for (const slot of slots) {
    // Create day key (YYYY-MM-DD in UTC)
    const dayStart = new Date(slot.start)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dateKey = dayStart.toISOString().split('T')[0]

    if (!map.has(dateKey)) {
      map.set(dateKey, {
        date: dayStart,
        is_available: false,
        slots: [],
        view: "day",
      })
    }

    const day = map.get(dateKey)!
    day.slots.push(slot)
    
    // Day is available if any slot is available
    if (slot.available) {
      day.is_available = true
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.date.getTime() - b.date.getTime()
  )
}

function projectToMonthView(
  ranges: TimeRange[],
  layers: AvailabilityLayer[],
  startDate: Date,
  endDate: Date
): BookingAvailability[] {
  const days: BookingAvailability[] = []
  const cursor = new Date(startDate)

  while (cursor <= endDate) {
    const dayStart = new Date(cursor)
    dayStart.setUTCHours(0, 0, 0, 0)

    const dayEnd = new Date(dayStart)
    dayEnd.setUTCHours(23, 59, 59, 999)

    // A day is available if there is any available time in it.
    const isAvailable = ranges.some(
      (r) => r.start < dayEnd && r.end > dayStart
    );

    // Find layers affecting this day
    const affectingLayers = layers.filter(layer => 
      layer.time_range.start < dayEnd && 
      layer.time_range.end > dayStart
    ).sort((a, b) => b.priority - a.priority)

    days.push({
      date: dayStart,
      is_available: isAvailable,
      view: "month",
      layers: affectingLayers,
      effective_layer: affectingLayers[0],
      slots: [], // Month view doesn't need individual slots
    })

    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return days
}

export class BookingAvailabilityService {

  /**
   * Get availability with full layer attribution
   * This is the primary method that should be used
   */
  getAvailabilityWithLayers(
    bookingResource: BookingResourceType,
    startDate: Date,
    endDate: Date
  ): {
    ranges: TimeRange[]
    layers: AvailabilityLayer[]
  } {
    function startOfUTCDay(d: Date): Date {
      const x = new Date(d)
      x.setUTCHours(0, 0, 0, 0)
      return x
    }

    function endOfUTCDayExclusive(d: Date): Date {
      const x = new Date(d)
      x.setUTCHours(0, 0, 0, 0)
      x.setUTCDate(x.getUTCDate() + 1)
      return x
    }

    const baseStart = startOfUTCDay(startDate)
    const baseEnd = endOfUTCDayExclusive(endDate)

    const layers: AvailabilityLayer[] = []
    
    // Layer 0: Base availability
    layers.push({
      source_type: 'base',
      effect: 'grant',
      priority: 0,
      time_range: { start: baseStart, end: baseEnd },
    })
    
    // Availability rules
    const activeRules = bookingResource.booking_resource_availability_rules
      .filter(r => r.is_active)
      .sort((a, b) => a.priority - b.priority)
    
    for (const rule of activeRules) {
      layers.push({
        source_type: 'availability_rule',
        source_id: rule.id,
        source_name: rule.name,
        effect: rule.effect === 'available' ? 'grant' : 'block',
        priority: rule.priority,
        time_range: {
          start: rule.valid_from ?? baseStart,
          end: rule.valid_until ?? baseEnd
        },
      })
    }
    
    // Allocations
    const allocations = bookingResource.booking_resource_allocations
      .filter(a => a.status !== 'cancelled')
    
    for (const allocation of allocations) {
      layers.push({
        source_type: 'allocation',
        source_id: allocation.id,
        source_name: `Allocation ${allocation.id}`,
        effect: 'block',
        priority: 999,
        time_range: {
          start: allocation.start_time,
          end: allocation.end_time
        },
        metadata: {
          allocation_type: allocation.status === 'hold' ? 'hold' : 'booked',
          allocation_expires_at: allocation.expires_at || undefined
        }
      })
    }
    
    const availability = computeAvailabilityFromLayers(
      layers,
      startDate,
      endDate
    )
    
    return { ranges: availability, layers }
  }

  getAvailability(
    bookingResource: BookingResourceType,
    from: Date,
    to: Date,
    view: "month" | "week" | "day"
  ): BookingAvailability[] {
    const { ranges, layers } = this.getAvailabilityWithLayers(
      bookingResource,
      from,
      to
    )

    if (view === "month") {
      return projectToMonthView(ranges, layers, from, to)
    }

    const resolution =
      view === "week"
        ? { unit: "minute" as const, value: 30 }
        : { unit: "minute" as const, value: 15 }

    const slots = generateSlotsWithAttribution(
      ranges,
      layers,
      from,
      to,
      resolution
    )
    
    return groupSlotsByDay(slots)
  }

  isAvailable(
    bookingResource: BookingResourceType,
    startDate: Date,
    endDate: Date
  ): boolean {
    const { ranges } = this.getAvailabilityWithLayers(
      bookingResource,
      startDate,
      endDate
    )

    return ranges.some(
      r => r.start <= startDate && r.end >= endDate
    )
  }
}