import { BookingResourceDTO } from "./booking-resource"

type BookingAvailabilityLayerDTO = {
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

type BookingAvailabilitySlot = {
  start: Date,
  end: Date,
  available: boolean,
  layers: BookingAvailabilityLayerDTO[],
  effective_layer?: BookingAvailabilityLayerDTO
}

type BookingAvailabilityDTO = {
  date: Date, 
  is_available: boolean
  slots: BookingAvailabilitySlot[],
  layers?: BookingAvailabilityLayerDTO[],
  effective_layer?: BookingAvailabilityLayerDTO
}
type GetBookingResourceAvailabilityDTO = {
  booking_resource: BookingResourceDTO,
  availability: BookingAvailabilityDTO[]
}

export type {
  BookingAvailabilityLayerDTO,
  BookingAvailabilitySlot,
  BookingAvailabilityDTO,
  GetBookingResourceAvailabilityDTO
}