import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourcePricingConfigType, BookingResourceType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"
import { createProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
import { BookingResourcePricing } from "../../../modules/booking/types/api"

type StepInput = {
  productId: string,
  bookingResource: BookingResourceType,
  bookingResourcePricing: {
    config: Omit<BookingResourcePricingConfigType, "id" | "booking_resource" | "product_variant_id">,
    pricing: BookingResourcePricing[]
  }[],
}

const stepCreateBookingResourcePricing = createStep(
  "step-creating-booking-resource-pricing", 
  async ({ productId, bookingResource, bookingResourcePricing } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    for (const bookingPricing of bookingResourcePricing) {
      const { result } = await createProductVariantsWorkflow(container).run({
        input: {
          product_variants: [{
            product_id: productId,
            title: `${bookingResource.title}-${bookingPricing.config.unit}`,
            manage_inventory: false,
            prices: bookingPricing.pricing
          }]
        }
      })

      await bookingModuleService.createBookingResourcePricingConfigs({
        ...bookingPricing.config,
        product_variant_id: result[0].id,
        booking_resource_id: bookingResource.id
      })
    }
    
    return new StepResponse()
  }
)

export default stepCreateBookingResourcePricing