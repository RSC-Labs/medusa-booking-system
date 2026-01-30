import { model } from "@medusajs/framework/utils";
import BookingResource from "./bookingResource";
import BookingLineItem from "./bookingLineItem";
import BookingCartItem from "./bookingCartItem";

const BookingResourceAllocation = model.define("booking_resource_allocation", {
  id: model.id().primaryKey(),

  booking_cart_item: model
    .belongsTo(() => BookingCartItem, {
      mappedBy: "booking_resource_allocation",
    })
    .nullable(),

  booking_line_item: model
    .belongsTo(() => BookingLineItem, {
      mappedBy: "booking_resource_allocation",
    })
    .nullable(),

  booking_resource: model.belongsTo(() => BookingResource, {
    mappedBy: "booking_resource_allocations",
  }),

  start_time: model.dateTime(),
  end_time: model.dateTime(),
  expires_at: model.dateTime().nullable(),

  status: model.enum(["hold", "reserved", "confirmed", "cancelled"]),

  cancellation_reason: model.text().nullable(),

  metadata: model.json().nullable(),
});

export default BookingResourceAllocation;
