import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingId: string,
}

const cancelBookingAllocationStep = createStep(
  "step-cancelling-booking-allocation", 
  async ({ bookingId } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const booking = await bookingModuleService.retrieveBooking(bookingId, {
      relations: ["booking_line_items.booking_resource_allocation"],
    })

    const bookingLineItems = booking.booking_line_items

    for (const bookingLineItem of bookingLineItems) {
      const bookingResourceAllocation = bookingLineItem.booking_resource_allocation
      if (bookingResourceAllocation) {
        await bookingModuleService.updateBookingResourceAllocations({
          id: bookingResourceAllocation.id,
          status: "cancelled",
        })
      }
    }

    return new StepResponse(booking)
  }
)

export default cancelBookingAllocationStep