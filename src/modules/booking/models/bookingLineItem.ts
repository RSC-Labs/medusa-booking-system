import { model } from "@medusajs/framework/utils"
import Booking from "./booking"
import BookingResourceAllocation from "./bookingResourceAllocation"

const BookingLineItem = model.define("booking_line_item", {
  id: model.id().primaryKey(),

  booking: model.belongsTo(() => Booking, {
    mappedBy: "booking_line_items"
  }),

  booking_resource_allocation: model.hasOne(() => BookingResourceAllocation, {
    mappedBy: "booking_line_item"
  }),
  start_time: model.dateTime(),
  end_time: model.dateTime(),

  // Pricing snapshot fields
  currency_code: model.text().nullable(),

  // Pricing configuration and units actually used for this line
  unit: model.enum(["second", "minute", "hour", "day", "custom"]).nullable(),
  unit_value: model.number().nullable(),
  units_booked: model.number().nullable(),

  // Monetary snapshot for this booking line item
  unit_price: model.number().nullable(),
  total: model.number().nullable(),

  // Optional links back to ecommerce side
  order_item_id: model.text().nullable(),
  product_variant_id: model.text().nullable(),
  
  metadata: model.json().nullable()
})

export default BookingLineItem
