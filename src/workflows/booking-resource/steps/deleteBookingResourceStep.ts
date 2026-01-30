import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourceType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingResourceId: string
}

const stepDeleteBookingResource = createStep(
  "step-delete-booking-resource", 
  async ({ bookingResourceId } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const result = await bookingModuleService.deleteBookingResources(bookingResourceId)
    return new StepResponse(result)
  }
)

export default stepDeleteBookingResource