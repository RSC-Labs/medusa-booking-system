import BookingModule from "../modules/booking"
import OrderModule from "@medusajs/medusa/order"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: BookingModule.linkable.booking.id,
    field: "order_id"
  },
  OrderModule.linkable.order,
  {
    readOnly: true
  }
)