import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows"
import stepAddBookingResourceAllocationStep from "./steps/addBookingResourceAllocationStep"
import stepRetrieveBookingResource from "./steps/retrieveBookingResourceStep"
import stepNormalizeDateRange from "./steps/normalizeDateRangeStep"

export type HoldBookingResourceWorkflowInput = {
  bookingResourceId: string,
  startDate: Date,
  endDate: Date
}

const holdBookingResourceWorkflow = createWorkflow(
  "hold-booking-resource",
  function (input: HoldBookingResourceWorkflowInput) {

    acquireLockStep({
      key: input.bookingResourceId,
      timeout: 2,
      ttl: 5
    })

    const bookingResource = stepRetrieveBookingResource({
      bookingResourceId: input.bookingResourceId
    })

    const bookingMode: 'time' | 'date' = transform(
      { bookingResource },
      (data) => data.bookingResource.booking_resource_pricing_configs[0].unit === 'day' ? 'date' : 'time'
    )

    const normalizedDateRange = stepNormalizeDateRange({
      bookingMode: bookingMode,
      startDate: input.startDate,
      endDate: input.endDate
    })

    const normalizedDates: {
      startDate: Date,
      endDate: Date
    } = transform(
      { normalizedDateRange },
      (data) => data.normalizedDateRange
    )

    const bookingAllocation = stepAddBookingResourceAllocationStep({
      bookingResourceId: input.bookingResourceId,
      startDate: normalizedDates.startDate,
      endDate: normalizedDates.endDate,
      status: "reserved",
      expires_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 1)
    })

    releaseLockStep({
      key: input.bookingResourceId
    })

    return new WorkflowResponse(bookingAllocation)
  }
)

export default holdBookingResourceWorkflow