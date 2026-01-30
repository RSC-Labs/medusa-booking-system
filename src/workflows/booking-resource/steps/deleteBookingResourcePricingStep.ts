import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourceType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingResource: BookingResourceType
}

const stepDeleteBookingResourcePricing = createStep(
  "step-delete-booking-resource-pricing", 
  async ({ bookingResource } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const result = await bookingModuleService.listBookingResourcePricingConfigs({
      booking_resourc: ""
    }, {
      
    })
    return new StepResponse(result)
  }
)

export default stepDeleteBookingResourcePricing