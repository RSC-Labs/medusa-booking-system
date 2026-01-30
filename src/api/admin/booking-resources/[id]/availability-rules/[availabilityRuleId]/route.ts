import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import BookingModuleService from "../../../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../../../modules/booking";
import { BookingResourceAvailabilityRuleType } from "../../../../../../modules/booking/types/booking";

type PostAdminBookingResourceAvailablityRuleType = {
  bookingResourceAvailabilityRule: BookingResourceAvailabilityRuleType
}

export async function GET (
  req: MedusaRequest,
  res: MedusaResponse
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );

  const id = req.params.availabilityRuleId;

  const result = await bookingModuleService.retrieveBookingResourceAvailabilityRule(id);

  res.json(result);
}

export async function DELETE (
  req: MedusaRequest,
  res: MedusaResponse
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );

  const id = req.params.availabilityRuleId;
  
  await bookingModuleService.deleteBookingResourceAvailabilityRules(id);

  res.json({})
}

export async function POST (
  req: MedusaRequest<PostAdminBookingResourceAvailablityRuleType>,
  res: MedusaResponse
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );

  const id = req.params.availabilityRuleId;

  const body = req.body

  const result = bookingModuleService.updateBookingResourceAvailabilityRules({
    id: id,
    rule_type: body.bookingResourceAvailabilityRule.rule_type,
    name: body.bookingResourceAvailabilityRule.name,
    effect: body.bookingResourceAvailabilityRule.effect,
    priority: body.bookingResourceAvailabilityRule.priority,
    description: body.bookingResourceAvailabilityRule.description,
    configuration: body.bookingResourceAvailabilityRule.configuration,
    valid_from: body.bookingResourceAvailabilityRule.valid_from,
    valid_until: body.bookingResourceAvailabilityRule.valid_until,

    booking_resource_id: id
  })

  res.json(result)
}

export const AUTHENTICATE = false