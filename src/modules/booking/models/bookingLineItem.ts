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
  
  metadata: model.json().nullable()
})

export default BookingLineItem
