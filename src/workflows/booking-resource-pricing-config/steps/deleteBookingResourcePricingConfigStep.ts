import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourcePricingConfigType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  config: Omit<BookingResourcePricingConfigType, "booking_resource">,
}

const stepDeleteBookingResourcePricing = createStep(
  "step-delete-booking-resource-pricing", 
  async ({ config } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    await bookingModuleService.deleteBookingResourcePricingConfigs(config.id)

    return new StepResponse()
  }
)

export default stepDeleteBookingResourcePricing