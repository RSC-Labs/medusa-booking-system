import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourceType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingResource: Omit<BookingResourceType, "booking_resource_availability_rules" | "booking_resource_pricing_configs" | "booking_resource_allocations">
}

const stepUpdateBookingResource = createStep(
  "step-update-booking-resource", 
  async ({ bookingResource } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const result = await bookingModuleService.updateBookingResources({
      ...bookingResource
    });
    return new StepResponse(result)
  }
)

export default stepUpdateBookingResource