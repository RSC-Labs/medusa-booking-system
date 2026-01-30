import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourcePricingConfigType } from "../../modules/booking/types/booking"
import { BookingResourcePricing } from "../../modules/booking/types/api"
import stepUpdateBookingResourcePricing from "./steps/updateBookingResourcePricingConfig"

export type UpdateBookingResourcePricingWorkflowInput = {
  bookingResourcePricing: {
    config: BookingResourcePricingConfigType,
    pricing: BookingResourcePricing[]
  },
}

const updateBookingResourcePricingWorkflow = createWorkflow(
  "update-booking-resource-pricing",
  function (input: UpdateBookingResourcePricingWorkflowInput) {

    const result = stepUpdateBookingResourcePricing({
      config: input.bookingResourcePricing.config,
      pricing: input.bookingResourcePricing.pricing
    })

    return new WorkflowResponse(result)
  }
)

export default updateBookingResourcePricingWorkflow