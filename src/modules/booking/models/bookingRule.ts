import { model } from "@medusajs/framework/utils";

const BookingRule = model.define("booking_rule", {
  id: model.id().primaryKey(),

  // Name and description
  name: model.text(),
  description: model.text().nullable(),

  // Scope
  scope: model.enum(["global", "resource"]).default("global"),
  booking_resource_ids: model.array().nullable(),

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
});

export default BookingRule;
