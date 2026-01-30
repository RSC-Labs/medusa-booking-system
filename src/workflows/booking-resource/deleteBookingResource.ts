import { createWorkflow, transform, when } from "@medusajs/framework/workflows-sdk"
import { createProductsStep, createProductVariantsStep, deleteProductsStep, deleteProductVariantsStep, getAllProductsStep, getVariantsStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import stepCreateBookingResource from "./steps/createBookingResourceStep"
import { BookingResourceType } from "../../modules/booking/types/booking"
import stepDeleteBookingResource from "./steps/deleteBookingResourceStep"

export type DeleteBookingResourceWorkflowInput = {
  bookingResource: BookingResourceType
}

const deleteBookingResourceWorkflow = createWorkflow(
  "delete-booking-resource",
  function (input: DeleteBookingResourceWorkflowInput) {

    deleteProductsStep([input.bookingResource.product_id]);

    stepDeleteBookingResource({
      bookingResourceId: input.bookingResource.id
    })
  }
)

export default deleteBookingResourceWorkflow