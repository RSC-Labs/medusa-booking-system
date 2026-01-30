import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BookingResourcePricingConfigType, BookingResourceType } from "../../../modules/booking/types/booking"
import BookingModuleService from "../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../modules/booking"
import { createProductVariantsWorkflow, updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
import { BookingResourcePricing } from "../../../modules/booking/types/api"

type StepInput = {
  config: Omit<BookingResourcePricingConfigType, "booking_resource">,
  pricing: BookingResourcePricing[]
}

const stepUpdateBookingResourcePricing = createStep(
  "step-update-booking-resource-pricing", 
  async ({ config, pricing } : StepInput, { container }) => {

    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE)

    const bookingResource = await bookingModuleService.retrieveBookingResource(config.booking_resource_id)

    const updatedPricingConfig = await bookingModuleService.updateBookingResourcePricingConfigs({
      ...config,
    })

    const { result }= await updateProductVariantsWorkflow(container).run({
      input: {
        product_variants: [{
          id: config.product_variant_id,
          title: `${bookingResource.title}-${config.unit}`,
          manage_inventory: false,
          prices: pricing
        }]
      }
    })

    return new StepResponse({
      booking_resource_pricing_config: updatedPricingConfig,
      product_variant: result[0]
    })
  }
)

export default stepUpdateBookingResourcePricing