import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import stepExpireAllocations from "./steps/expireAllocationsStep"
import stepRetrieveExpiredAllocations from "./steps/retrieveExpiredAllocationsStep"

const checkExpiredAllocationsWorkflow = createWorkflow(
  "check-expired-allocations",
  function () {

    const expiredAllocations = stepRetrieveExpiredAllocations()

    const bookingResourceAllocationIds = transform(
      { expiredAllocations },
      (data) => data.expiredAllocations.map((allocation) => allocation.id)
    )
   
    stepExpireAllocations({ bookingResourceAllocationIds })
    
    return new WorkflowResponse({})
  }
)

export default checkExpiredAllocationsWorkflow