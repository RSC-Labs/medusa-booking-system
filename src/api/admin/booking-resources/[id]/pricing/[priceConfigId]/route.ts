import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { BookingResourcePricingConfigType } from "../../../../../../modules/booking/types/booking"
import { BookingResourcePricing } from "../../../../../../modules/booking/types/api"
import updateBookingResourcePricingWorkflow from "../../../../../../workflows/booking-resource-pricing-config/updateBookingResourcePricingConfig"
import BookingModuleService from "../../../../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../../../../modules/booking"
import deleteBookingResourcePricingWorkflow from "../../../../../../workflows/booking-resource-pricing-config/deleteBookingResourcePricingConfig"

type PostAdminBookingResourcePricingType = {
  config: BookingResourcePricingConfigType,
  pricing: BookingResourcePricing[]
}

export async function POST (
  req: MedusaRequest<PostAdminBookingResourcePricingType>,
  res: MedusaResponse
) {

  const { result } = await updateBookingResourcePricingWorkflow(req.scope).run({
    input: {
      bookingResourcePricing: {
        config: req.body.config,
        pricing: req.body.pricing
      }
    }
  })
  res.json(result)
}

export async function DELETE (
  req: MedusaRequest,
  res: MedusaResponse
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );

  await deleteBookingResourcePricingWorkflow(req.scope).run({
    input: {
      bookingResourcePricingConfig: await bookingModuleService.retrieveBookingResourcePricingConfig(req.params.priceConfigId)
    }
  })
  res.json({})
}

export const AUTHENTICATE = false