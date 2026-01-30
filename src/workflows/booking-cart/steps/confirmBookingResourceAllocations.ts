import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingCartItemType, BookingResourcePricingConfigType, BookingResourceType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingCartItems: BookingCartItemType[]
}

const stepConfirmBookingResourceAllocations = createStep(
  "step-confirm-booking-resource-allocations", 
  async ({ bookingCartItems } : StepInput, { container }) => {


    console.log("bookingCartItems", bookingCartItems);

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    for (const bookingCartItem of bookingCartItems) {
      await bookingModuleService.updateBookingResourceAllocations({
        id: bookingCartItem.booking_resource_allocation.id,
        status: "confirmed"
      })
    }
    
    return new StepResponse()
  }
)

export default stepConfirmBookingResourceAllocations