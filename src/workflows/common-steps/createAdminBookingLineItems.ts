import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import BookingModuleService from "../../modules/booking/service"
import { BOOKING_MODULE } from "../../modules/booking"
import { BookingLineItemType } from "../../modules/booking/types/booking"

type StepInput = {
  bookingResourceAllocationIds: string[],
  bookingId: string,
  startDate: Date,
  endDate: Date,
}

const stepCreateAdminBookingLineItems = createStep(
  "step-creating-admin-booking-line-items", 
  async ({ bookingResourceAllocationIds, bookingId, startDate, endDate } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const bookingLineItemsCreated: BookingLineItemType[] = []

    for (const bookingResourceAllocationId of bookingResourceAllocationIds) {
      const created = await bookingModuleService.createBookingLineItems({
        booking_resource_allocation: bookingResourceAllocationId,
        booking_id: bookingId,
        start_time: startDate,
        end_time: endDate
      })
      bookingLineItemsCreated.push(created)
    }

    return new StepResponse(bookingLineItemsCreated)
  }
)

export default stepCreateAdminBookingLineItems