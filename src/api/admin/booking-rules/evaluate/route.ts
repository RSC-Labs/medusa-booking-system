import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import BookingModuleService from "../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../modules/booking";
import type { ResolvedRules } from "../../../../modules/booking/types/rules";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  const evaluationTime = req.query.evaluation_time as string | undefined;
  const bookingResourceId = req.query.booking_resource_id as string | undefined;

  if (!evaluationTime) {
    return res.status(400).json({
      message: "Query parameter evaluation_time (ISO date string) is required",
    });
  }

  const at = new Date(evaluationTime);
  if (Number.isNaN(at.getTime())) {
    return res.status(400).json({
      message: "evaluation_time must be a valid ISO date string",
    });
  }

  const resolved_rules: ResolvedRules = await bookingModuleService.resolveRules(
    at,
    bookingResourceId || undefined,
  );

  res.json({ resolved_rules });
}

export const AUTHENTICATE = true;
