import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourceType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import booking, { BOOKING_MODULE } from "../../../modules/booking"

type StepInput = {
  bookingMode: 'date' | 'time',
  startDate: Date,
  endDate: Date,
}

const stepNormalizeDateRange = createStep(
  "step-normalize-date-range", 
  ({ bookingMode, startDate, endDate } : StepInput, { container }) => {

    if (bookingMode === 'date') {
      return new StepResponse({
        startDate: startDate,
        endDate: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1))
      })
      
    } else {
      return new StepResponse({
        startDate: startDate,
        endDate: endDate
      })
    }
  }
)

export default stepNormalizeDateRange