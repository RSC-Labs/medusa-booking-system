import { model } from "@medusajs/framework/utils"
import BookingResource from "./bookingResource"

const BookingResourceAvailabilityRule = model.define("booking_resource_availability_rule", {
  id: model.id().primaryKey(),
  
  booking_resource: model.belongsTo(() => BookingResource, {
    mappedBy: "booking_resource_availability_rules"
  }),
  
  rule_type: model.text(),
  name: model.text().unique(),
  description: model.text().searchable().nullable(),
  
  // Rule behavior
  effect: model.enum(["available", "unavailable"]).default("available"),
  
  priority: model.number().default(0).unique(),
  
  valid_from: model.dateTime().nullable(),
  valid_until: model.dateTime().nullable(),
  
  configuration: model.json(),
  
  is_active: model.boolean().default(true),
  
  metadata: model.json().nullable(),
})

export default BookingResourceAvailabilityRule
