import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingResourceId: string,
  unit: "second" | "minute" | "hour" | "day" | "custom",
}

const retrievePricingConfigsForBookingResource = createStep(
  "step-retrieving-pricing-configs-for-booking-resource", 
  async ({ bookingResourceId, unit } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const pricingConfigs = await bookingModuleService.listBookingResourcePricingConfigs({
      booking_resource_id: bookingResourceId,
      unit: unit
    })

    return new StepResponse(pricingConfigs)
  }
)

export default retrievePricingConfigsForBookingResource