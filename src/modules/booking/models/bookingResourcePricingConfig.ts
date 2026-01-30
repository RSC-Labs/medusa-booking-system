import { model } from "@medusajs/framework/utils"
import BookingResource from "./bookingResource"

const BookingResourcePricingConfig = model.define("booking_resource_pricing_config", {
  id: model.id().primaryKey(),

  product_variant_id: model.text(),
  
  booking_resource: model.belongsTo(() => BookingResource, {
    mappedBy: "booking_resource_pricing_configs"
  }),

  unit: model.enum(["second", "minute", "hour", "day", "custom"]),
  unit_value: model.number().default(60),

  product_variant_title: model.text().nullable(),

  metadata: model.json().nullable()
})

export default BookingResourcePricingConfig
