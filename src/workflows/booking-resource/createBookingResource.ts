import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourceType, BookingResourceAvailabilityRuleType, BookingResourcePricingConfigType } from "../../modules/booking/types/booking"
import { createProductsStep } from "@medusajs/medusa/core-flows"
import stepCreateBookingResource from "./steps/createBookingResourceStep"
import { BookingResourcePricing, BookingResourceProductDetails } from "../../modules/booking/types/api"
import createBookingResourcePricingWorkflow from "../booking-resource-pricing-config/createBookingResourcePricingConfig"

export type CreateBookingResourceWorkflowInput = {
  booking_resource: Omit<BookingResourceType, "id"> & BookingResourceProductDetails
  booking_resource_availablity_rules?: Omit<BookingResourceAvailabilityRuleType, "id" | "booking_resource">[]
  booking_resource_pricing?: {
    config: Omit<BookingResourcePricingConfigType, "id" | "booking_resource" | "product_variant_id">,
    pricing: BookingResourcePricing[]
  }[]
}

const createBookingResourceWorkflow = createWorkflow(
  "create-booking-resource",
  function (input: CreateBookingResourceWorkflowInput) {

    const handle = transform(
      { input },
      (data) => data.input.booking_resource.handle ?? `${data.input.booking_resource.resource_type.toLowerCase()}-${data.input.booking_resource.title.toLowerCase()}`
    )

    const products = createProductsStep([{
      title: input.booking_resource.title,
      description: input.booking_resource.description ?? undefined,
      handle: handle
    }])

    const productId = transform(
      { products },
      (data) => data.products![0].id
    )

    const bookingResourceCreated = stepCreateBookingResource({
      bookingResource: input.booking_resource,
      productId: productId
    })

    when(
      input,
      (data) => {
        return data.booking_resource_pricing ? data.booking_resource_pricing.length > 0 : false
      }
    ).then(() => {
      createBookingResourcePricingWorkflow.runAsStep({
        input: {
          bookingResource: bookingResourceCreated,
          bookingResourcePricing: input.booking_resource_pricing ?? []
        }
      })
    })

    return new WorkflowResponse(bookingResourceCreated)
  }
)

export default createBookingResourceWorkflow