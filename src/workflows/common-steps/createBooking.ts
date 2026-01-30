import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import BookingModuleService from "../../modules/booking/service"
import { BOOKING_MODULE } from "../../modules/booking"

type StepInput = {
  orderId: string,
  startDate: Date,
  endDate: Date,
}

const stepCreateBooking = createStep(
  "step-create-booking", 
  async ({ orderId, startDate, endDate } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const bookingCreated = await bookingModuleService.createBookings({
      order_id: orderId,
      booking_number: `BKG-${Date.now()}`,
      start_time: startDate,
      end_time: endDate,
      status: "confirmed"
    })
    
    return new StepResponse(bookingCreated)
  }
)

export default stepCreateBooking