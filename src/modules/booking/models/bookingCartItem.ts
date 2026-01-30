import { model } from "@medusajs/framework/utils"
import BookingResourceAllocation from "./bookingResourceAllocation"

const BookingCartItem = model.define("booking_cart_item", {
  id: model.id().primaryKey(),
  
  cart_id: model.text(),
  cart_line_item_id: model.text(),
  
  booking_resource_allocation: model.hasOne(() => BookingResourceAllocation, {
    mappedBy: "booking_cart_item"
  }),

  start_time: model.dateTime().nullable(),
  end_time: model.dateTime().nullable(),
  
  status: model.enum(["reserved", "expired", "converted"]),
  expires_at: model.dateTime().nullable(),
  
  metadata: model.json().nullable(),
})

export default BookingCartItem