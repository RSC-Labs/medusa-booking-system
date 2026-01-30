import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourceType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingResourceId: string
}

const stepRetrieveBookingResource = createStep(
  "step-retrieve-booking-resource", 
  async ({ bookingResourceId } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const result = await bookingModuleService.retrieveBookingResource(bookingResourceId, {
      relations: ["booking_resource_pricing_configs", "booking_resource_availability_rules", "booking_resource_allocations"]
    });
    return new StepResponse(result)
  }
)

export default stepRetrieveBookingResource