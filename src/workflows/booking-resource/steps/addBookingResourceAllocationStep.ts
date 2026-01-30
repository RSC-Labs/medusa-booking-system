import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourceType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingResourceId: string,
  startDate: Date,
  endDate: Date,
  status: "confirmed" | "cancelled" | "reserved" | undefined;
  expires_at?: Date
}

const stepAddBookingResourceAllocationStep = createStep(
  "step-add-booking-resource-allocation", 
  async ({ bookingResourceId, startDate, endDate, status, expires_at } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const result = await bookingModuleService.createBookingResourceAllocations({
      booking_resource_id: bookingResourceId,
      start_time: startDate,
      end_time: endDate,
      status: status,
      expires_at: expires_at 
    })
    return new StepResponse(result)
  }
)

export default stepAddBookingResourceAllocationStep