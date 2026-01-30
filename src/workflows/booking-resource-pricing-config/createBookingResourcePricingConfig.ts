import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { BookingResourceType, BookingResourcePricingConfigType } from "../../modules/booking/types/booking"
import { BookingResourcePricing } from "../../modules/booking/types/api"
import stepCreateBookingResourcePricing from "./steps/createBookingResourcePricingConfigStep"

export type CreateBookingResourcePricingWorkflowInput = {
  bookingResource: BookingResourceType,
  bookingResourcePricing: {
    config: Omit<BookingResourcePricingConfigType, "id" | "booking_resource" | "product_variant_id">,
    pricing: BookingResourcePricing[]
  }[],
}

const createBookingResourcePricingWorkflow = createWorkflow(
  "create-booking-resource-pricing",
  function (input: CreateBookingResourcePricingWorkflowInput) {

    stepCreateBookingResourcePricing({
      productId: input.bookingResource.product_id,
      bookingResource: input.bookingResource,
      bookingResourcePricing: input.bookingResourcePricing
    })
  }
)

export default createBookingResourcePricingWorkflow