enum BookingResourcePricingConfigUnit {
  // second = "second",
  // minute = "minute",
  // hour = "hour",
  day = "day"
  // custom = "custom"
}

type BookingResourcePricingConfigDTO = {
  id: string,
  unit: BookingResourcePricingConfigUnit,
  unit_value: number,
  metadata?: Record<string, string>
}

type BookingResourcePricingDTO = {
  amount: number
  currency_code: string
}

type BookingResourceAllocationDTO = {
  id: string,
  start_time: Date,
  end_time: Date,
  expires_at?: Date,
  status: "hold" | "reserved" | "confirmed" | "cancelled",
  metadata?: Record<string, string>
}

type BookingResourceAvailabilityRuleDTO = {
  id: string,
  rule_type: string,
  name: string,
  description?: string,
  effect: string,
  priority: number,
  valid_from: Date,
  valid_until: Date,
  configuration: Record<string, string>
  is_active: boolean,
  metadata?: Record<string, string>
}
type BookingResourceDTO = {
  id: string,
  resource_type: string,
  is_bookable: boolean,
  title: string,
  subtitle: string,
  description: string,
  status?: string,
  metadata?: Record<string, string>
  booking_resource_availability_rules?: BookingResourceAvailabilityRuleDTO[],
  booking_resource_allocations?: BookingResourceAllocationDTO[],
  booking_resource_pricing_configs?: BookingResourcePricingConfigDTO[]
}

type BookingResourceProductDetailsDTO = {
  handle?: string
}

type UpdateBookingResourceDTO = {
  booking_resource: BookingResourceDTO,
  booking_resource_product_details?: BookingResourceProductDetailsDTO
}

type UpdateBookingResourcePricingDTO = {
  config: BookingResourcePricingConfigDTO,
  pricing: BookingResourcePricingDTO[]
}

/** Booking rule summary returned on resource detail (rules that apply to this resource). */
export type BookingRuleSummaryDTO = {
  id: string
  name: string
  scope: "global" | "resource"
  priority: number
  is_active: boolean
}

type GetBookingResourceDTO = {
  booking_resource: BookingResourceDTO,
  booking_resource_availability_rules: BookingResourceAvailabilityRuleDTO[],
  booking_resource_pricing_configs: UpdateBookingResourcePricingDTO[],
  booking_rules?: BookingRuleSummaryDTO[],
}

type GetBookingResourcesDTO = {
  booking_resources: BookingResourceDTO[],
  count: number
}

type UpdateBookingResourcesDTO = {
  booking_resource: BookingResourceDTO,
}

export type {
  BookingResourceDTO,
  BookingResourceAllocationDTO,
  BookingResourceAvailabilityRuleDTO,
  BookingResourcePricingConfigDTO,
  BookingRuleSummaryDTO,
  BookingResourceProductDetailsDTO,
  UpdateBookingResourceDTO,
  GetBookingResourceDTO,
  GetBookingResourcesDTO,
  UpdateBookingResourcesDTO,
  UpdateBookingResourcePricingDTO,
  BookingResourcePricingDTO,
}

export {
  BookingResourcePricingConfigUnit
}