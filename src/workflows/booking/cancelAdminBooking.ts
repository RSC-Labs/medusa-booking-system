import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"
import retrieveBookingStep from "./steps/retrieveBookingStep"
import cancelBookingStep from "./steps/cancelBookingStep"
import cancelBookingAllocationStep from "./steps/cancelBookingAllocationStep"

export type CancelAdminBooking = {
  bookingId: string,
}

const cancelAdminBooking = createWorkflow(
  "cancel-admin-booking",
  function (input: CancelAdminBooking) {

    const retrievedBooking = retrieveBookingStep({
      bookingId: input.bookingId,
    })

    const booking = transform(
      { retrievedBooking },
      (data) => data.retrievedBooking
    )

    cancelOrderWorkflow.runAsStep({
      input: {
        order_id: booking.order_id,
      }
    })

    cancelBookingAllocationStep({
      bookingId: input.bookingId,
    })

    const cancelledBooking = cancelBookingStep({
      bookingId: input.bookingId,
    })  

    const result = transform(
      { cancelledBooking },
      (data) => data.cancelledBooking
    )

    return new WorkflowResponse(result)
  }
)

export default cancelAdminBooking