import { createWorkflow} from "@medusajs/framework/workflows-sdk"
import { updateProductsStep } from "@medusajs/medusa/core-flows"
import { BookingResourceType } from "../../modules/booking/types/booking"
import stepUpdateBookingResource from "./steps/updateBookingResourceStep"

export type UpdateBookingResourceWorkflowInput = {
  bookingResource: Omit<BookingResourceType, "booking_resource_availability_rules" | "booking_resource_pricing_configs" | "booking_resource_allocations">
}

const updateBookingResourceWorkflow = createWorkflow(
  "update-booking-resource",
  function (input: UpdateBookingResourceWorkflowInput) {

    stepUpdateBookingResource({
      bookingResource: input.bookingResource
    })

    updateProductsStep({
      products: [{
        id: input.bookingResource.product_id,
        subtitle: input.bookingResource.subtitle,
        title: input.bookingResource.title,
        description: input.bookingResource.description ?? undefined,
        status: input.bookingResource.status,
      }]
    })
  }
)

export default updateBookingResourceWorkflow