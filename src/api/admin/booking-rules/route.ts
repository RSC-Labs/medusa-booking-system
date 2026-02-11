import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import BookingModuleService from "../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../modules/booking";
import { BookingRuleType } from "../../../modules/booking/types/booking";

type PostAdminBookingRuleBody = Omit<
  BookingRuleType,
  "id" | "created_at" | "updated_at" | "deleted_at"
> & {
  name: string;
  scope: "global" | "resource";
  description?: string | null;
  booking_resource_ids?: string[] | null;
  require_payment?: boolean;
  require_confirmation?: boolean;
  reservation_ttl_seconds?: number;
  configuration?: Record<string, unknown> | null;
  priority?: number;
  is_active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  const rules = await bookingModuleService.listBookingRules();
  const [_, count] = await bookingModuleService.listAndCountBookingResources();
  res.json({
    booking_rules: rules as BookingRuleType[],
    booking_resources_count: count,
  });
}

export async function POST(
  req: MedusaRequest<PostAdminBookingRuleBody>,
  res: MedusaResponse,
) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);
  const body = req.body;

  const [created] = await bookingModuleService.createBookingRules([
    {
      name: body.name,
      description: body.description ?? null,
      scope: body.scope ?? "global",
      booking_resource_ids:
        body.scope === "resource" ? (body.booking_resource_ids ?? null) : null,
      require_payment: body.require_payment ?? true,
      require_confirmation: body.require_confirmation ?? false,
      reservation_ttl_seconds: body.reservation_ttl_seconds ?? 300,
      configuration: body.configuration ?? null,
      priority: body.priority ?? 0,
      is_active: body.is_active ?? true,
      valid_from: body.valid_from ? new Date(body.valid_from) : null,
      valid_until: body.valid_until ? new Date(body.valid_until) : null,
    },
  ]);

  res.status(201).json({ booking_rule: created });
}

export const AUTHENTICATE = true;
