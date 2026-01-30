import { createStep } from "@medusajs/framework/workflows-sdk"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingResourceAllocationIds: string[],
}

const stepExpireAllocations = createStep(
  "step-expire-allocations", 
  async ({ bookingResourceAllocationIds } : StepInput, { container }) => {


    

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    for (const bookingResourceAllocationId of bookingResourceAllocationIds) {
      await bookingModuleService.updateBookingResourceAllocations({
        id: bookingResourceAllocationId,
        status: "cancelled",
        cancellation_reason: "expired",
      })
    }
  }
)

export default stepExpireAllocations