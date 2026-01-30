// calendar.utils.ts
import { BookingResourcePricingConfigUnit } from "../../../types/booking-resource"
import { CalendarView } from "./calendar.types"

export function getDefaultCalendarView(resource: any): CalendarView {
  const units = resource.booking_resource_pricing_configs?.map(
    (c: any) => c.config.unit
  )

  if (!units || units.length === 0) return "month"

  if (units.includes(BookingResourcePricingConfigUnit.hour)) {
    return "week"
  }

  if (units.includes(BookingResourcePricingConfigUnit.day)) {
    return "month"
  }

  return "month"
}
