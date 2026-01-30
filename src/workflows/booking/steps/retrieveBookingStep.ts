import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingId: string,
}

const retrieveBookingStep = createStep(
  "step-retrieving-booking", 
  async ({ bookingId } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const booking = await bookingModuleService.retrieveBooking(bookingId)

    return new StepResponse(booking)
  }
)

export default retrieveBookingStep