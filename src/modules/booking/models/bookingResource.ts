import { model } from "@medusajs/framework/utils"
import BookingResourceAvailabilityRule from "./bookingResourceAvailabilityRule"
import BookingResourceAllocation from "./bookingResourceAllocation"
import BookingResourcePricingConfig from "./bookingResourcePricingConfig"

const BookingResource = model.define("booking_resource", {
  id: model.id().primaryKey(),

  booking_resource_availability_rules: model.hasMany(() => BookingResourceAvailabilityRule, {
    mappedBy: "booking_resource"
  }),

  booking_resource_allocations: model.hasMany(() => BookingResourceAllocation, {
    mappedBy: "booking_resource"
  }),

  booking_resource_pricing_configs: model.hasMany(() => BookingResourcePricingConfig, {
    mappedBy: "booking_resource"
  }),

  product_id: model.text(),

  status: model.enum(["draft", "published"]).default("draft"),

  resource_type: model.text(),
  
  is_bookable: model.boolean().default(true),

  // Product specific
  title: model.text(),
  subtitle: model.text().nullable(),
  description: model.text().nullable(),
  
  metadata: model.json().nullable()
}).cascades({
    delete: [
      "booking_resource_availability_rules",
      "booking_resource_allocations",
      "booking_resource_pricing_configs",
    ],
  })

export default BookingResource
