import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import BookingModuleService from "../../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../../modules/booking";
import { BookingResourcePricing } from "../../../../../modules/booking/types/api";
import deleteBookingResourceWorkflow from "../../../../../workflows/booking-resource/deleteBookingResource";
import createBookingResourcePricingWorkflow from "../../../../../workflows/booking-resource-pricing-config/createBookingResourcePricingConfig";
import { BookingResourcePricingConfigType } from "../../../../../modules/booking/types/booking";

type PostAdminBookingResourcePricingType = {
  booking_resource_pricing_config: Omit<BookingResourcePricingConfigType, "id" | "booking_resource" | "product_variant_id">,
  booking_resource_pricing: BookingResourcePricing[]
}

export async function DELETE (
  req: MedusaRequest,
  res: MedusaResponse
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );

  const bookingResource = await bookingModuleService.retrieveBookingResource(req.params.id)
  const { result } = await deleteBookingResourceWorkflow(req.scope).run({
    input: {
      bookingResource: bookingResource
    }
  })
  res.json(result)
}

export async function POST (
  req: MedusaRequest<PostAdminBookingResourcePricingType>,
  res: MedusaResponse
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );

  const bookingResource = await bookingModuleService.retrieveBookingResource(req.params.id)

  await createBookingResourcePricingWorkflow(req.scope).run({
    input: {
      bookingResource: bookingResource,
      bookingResourcePricing: [{
        config: req.body.booking_resource_pricing_config,
        pricing: req.body.booking_resource_pricing
      }]
    }
  })

  const bookingResourceWithPrices = await bookingModuleService.retrieveBookingResource(req.params.id,
    { relations: ["booking_resource_pricing_configs"]}
  )
  

  res.json({
    booking_resource: bookingResourceWithPrices
  })
}

export const AUTHENTICATE = false