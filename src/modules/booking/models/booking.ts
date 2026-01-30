import { model } from "@medusajs/framework/utils"
import BookingLineItem from "./bookingLineItem"

const Booking = model.define("booking", {
  id: model.id().primaryKey(),
  
  booking_number: model.text().searchable(),

  order_id: model.text(),
  
  // Derived from line items — not source of truth
  start_time: model.dateTime(),
  end_time: model.dateTime(),
  
  status: model.enum([
    "pending",       
    "confirmed",     
    "completed",     
    "cancelled",      
  ]).default("pending"),

  booking_line_items: model.hasMany(() => BookingLineItem, {
    mappedBy: "booking"
  }),
  
  confirmed_at: model.dateTime().nullable(),
  cancelled_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  reserved_at: model.dateTime().nullable(),
  
  metadata: model.json().nullable(),
})

export default Booking