import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingId: string,
}

const cancelBookingStep = createStep(
  "step-cancelling-booking", 
  async ({ bookingId } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const booking = await bookingModuleService.updateBookings({
      id: bookingId,
      status: "cancelled",
    })

    const cancelledBooking = await bookingModuleService.retrieveBooking(bookingId, {
      relations: ["booking_line_items"],
    })

    return new StepResponse(cancelledBooking)
  }
)

export default cancelBookingStep