import { model } from "@medusajs/framework/utils"

const BookingSetting = model.define("booking_setting", {
  id: model.id().primaryKey(),
  
  // Scope
  scope: model.enum(["global", "resource"]).default("global"),
  booking_resource_id: model.text().nullable(),
  
  // Requirements
  require_payment: model.boolean().default(true),
  require_confirmation: model.boolean().default(false),
  reservation_ttl_seconds: model.number().default(300),

  configuration: model.json().nullable(),
  
  // Properties
  priority: model.number().default(0),
  is_active: model.boolean().default(true),
  valid_from: model.dateTime().nullable(),
  valid_until: model.dateTime().nullable(),
})

export default BookingSetting
