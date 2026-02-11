import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import BookingModuleService from "../../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../../modules/booking";
import type { ResolvedRules } from "../../../../../modules/booking/types/rules";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  const resourceId = req.params.id as string;
  if (!resourceId) {
    return res.status(400).json({
      message: "Resource ID is required",
    });
  }

  const evaluationTime = req.query.evaluation_time as string | undefined;
  const at = evaluationTime ? new Date(evaluationTime) : new Date();

  if (Number.isNaN(at.getTime())) {
    return res.status(400).json({
      message: "evaluation_time must be a valid ISO date string",
    });
  }

  const resolved_rules: ResolvedRules = await bookingModuleService.resolveRules(
    at,
    resourceId,
  );

  res.json({ resolved_rules });
}

export const AUTHENTICATE = true;
