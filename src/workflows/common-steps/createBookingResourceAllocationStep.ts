import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import BookingModuleService from "../../modules/booking/service"
import { BOOKING_MODULE } from "../../modules/booking"

type StepInput = {
  bookingResourceId: string,
  startDate: Date,
  endDate: Date,
  status: "hold" | "reserved" | "confirmed" | "cancelled",
  expires_at?: Date
}

const stepCreateBookingResourceAllocation = createStep(
  "step-creating-booking-resource-allocation", 
  async ({ bookingResourceId, startDate, endDate, status, expires_at } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
    container.resolve(BOOKING_MODULE)

    const bookingResourceAllocation = await bookingModuleService.createBookingResourceAllocations({
      booking_resource_id: bookingResourceId,
      start_time: startDate,
      end_time: endDate,
      status: status,
      expires_at: expires_at
    })
   
    return new StepResponse(bookingResourceAllocation)
  }
)

export default stepCreateBookingResourceAllocation