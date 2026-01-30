import BookingModule from "../modules/booking"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: BookingModule.linkable.bookingResource.id,
    field: "product_id"
  },
  ProductModule.linkable.product,
  {
    readOnly: true
  }
)