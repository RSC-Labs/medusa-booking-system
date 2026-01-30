import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingCartItemType, BookingLineItemType} from "../../modules/booking/types/booking"
import BookingModuleService from "../../modules/booking/service"
import { BOOKING_MODULE } from "../../modules/booking"

type StepInput = {
  bookingId: string,
  bookingLineItems: BookingLineItemType[],
}

const stepUpdateBooking = createStep(
  "step-update-booking", 
  async ({ bookingId, bookingLineItems } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const bookingCreated = await bookingModuleService.updateBookings([{
      id: bookingId,
      booking_line_items: bookingLineItems.map(item => item.id)
    }])
    
    return new StepResponse(bookingCreated)
  }
)

export default stepUpdateBooking