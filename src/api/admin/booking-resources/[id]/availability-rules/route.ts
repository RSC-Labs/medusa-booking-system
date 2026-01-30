import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import BookingModuleService from "../../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../../modules/booking";
import { BookingResourceAvailabilityRuleType } from "../../../../../modules/booking/types/booking";

type PostAdminBookingResourceAvailablityRuleType = Omit<BookingResourceAvailabilityRuleType, "id">

export async function GET (
  req: MedusaRequest,
  res: MedusaResponse
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );
  const result = await bookingModuleService.listBookingResourceAvailabilityRules();
  res.json(result)
}

export async function POST (
  req: MedusaRequest<PostAdminBookingResourceAvailablityRuleType>,
  res: MedusaResponse
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );

  const id = req.params.id;

  const body = req.body

  const result = bookingModuleService.createBookingResourceAvailabilityRules({
    rule_type: body.rule_type,
    name: body.name,
    effect: body.effect,
    priority: body.priority,
    description: body.description,
    configuration: body.configuration,
    valid_from: body.valid_from,
    valid_until: body.valid_until,

    booking_resource_id: id
  })

  res.json(result)
}

export const AUTHENTICATE = false