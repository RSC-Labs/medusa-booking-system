import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import BookingModuleService from "../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../modules/booking";
import createBookingResourceWorkflow from "../../../workflows/booking-resource/createBookingResource";
import { BookingResourceAvailabilityRuleType, BookingResourcePricingConfigType, BookingResourceType } from "../../../modules/booking/types/booking";
import { BookingResourcePricing, BookingResourceProductDetails } from "../../../modules/booking/types/api";

type PostAdminBookingResourceType = {
  booking_resource: Omit<BookingResourceType, "id"> & BookingResourceProductDetails
  booking_resource_availablity_rules: Omit<BookingResourceAvailabilityRuleType, "id" | "booking_resource">[]
  booking_resource_pricing: {
    config: Omit<BookingResourcePricingConfigType, "id" | "booking_resource" | "product_variant_id">,
    pricing: BookingResourcePricing[]
  }[],
}

export async function GET (
  req: MedusaRequest,
  res: MedusaResponse
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );
  const result = await bookingModuleService.listAndCountBookingResources();
  res.json({
    booking_resources: result[0],
    count: result[1]
  })
}

export async function POST (
  req: MedusaRequest<PostAdminBookingResourceType>,
  res: MedusaResponse
) {

  const { result } = await createBookingResourceWorkflow(req.scope).run({
    input: req.body
  })
  
  res.json(result)
}

export const AUTHENTICATE = false