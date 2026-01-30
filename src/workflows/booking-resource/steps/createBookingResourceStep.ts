import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourceType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingResource: Omit<BookingResourceType, "id">,
  productId: string
}

const stepCreateBookingResource = createStep(
  "step-creating-booking-resource", 
  async ({ bookingResource, productId } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const result = await bookingModuleService.createBookingResources({
      ...bookingResource,
      booking_resource_availability_rules: [],
      booking_resource_pricing_configs: [],
      booking_resource_allocations: [],
      product_id: productId,
    })
    return new StepResponse(result)
  }
)

export default stepCreateBookingResource