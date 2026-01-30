import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

const stepRetrieveExpiredAllocations = createStep(
  "step-retrieve-expired-allocations", 
  async ({}, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const expiredAllocations = await bookingModuleService.listBookingResourceAllocations({
      status: "hold",
      expires_at: {
        $lt: new Date(),
      },
    })

    return new StepResponse(expiredAllocations)
  }
)

export default stepRetrieveExpiredAllocations