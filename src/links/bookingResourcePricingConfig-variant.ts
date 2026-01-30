import BookingModule from "../modules/booking"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: BookingModule.linkable.bookingResourcePricingConfig.id,
    field: "product_variant_id"
  },
  ProductModule.linkable.productVariant,
  {
    readOnly: true
  }
)