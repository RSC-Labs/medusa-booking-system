import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourcePricingConfigType } from "../../modules/booking/types/booking"
import stepDeleteBookingResourcePricing from "./steps/deleteBookingResourcePricingConfigStep"
import { deleteProductVariantsWorkflow } from "@medusajs/medusa/core-flows"

export type DeleteBookingResourcePricingWorkflowInput = {
  bookingResourcePricingConfig: BookingResourcePricingConfigType
}

const deleteBookingResourcePricingWorkflow = createWorkflow(
  "delete-booking-resource-pricing",
  function (input: DeleteBookingResourcePricingWorkflowInput) {

    const result = stepDeleteBookingResourcePricing({
      config: input.bookingResourcePricingConfig
    })

    deleteProductVariantsWorkflow.runAsStep({
      input: {
        ids: [input.bookingResourcePricingConfig.product_variant_id]
      }
    })

    return new WorkflowResponse(result)
  }
)

export default deleteBookingResourcePricingWorkflow