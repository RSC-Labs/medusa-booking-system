import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import BookingModuleService from "../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../modules/booking";
import {
  BookingResourceType,
  BookingRuleType,
} from "../../../../modules/booking/types/booking";

type PostAdminBookingRuleBody = Partial<
  Omit<BookingRuleType, "id" | "created_at" | "updated_at" | "deleted_at">
> & {
  scope?: "global" | "resource";
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
  const id = req.params.id as string;

  const bookingRule = await bookingModuleService.retrieveBookingRule(id);

  let booking_resources_count = 0;
  if (
    bookingRule.scope === "resource" &&
    bookingRule.booking_resource_ids &&
    bookingRule.booking_resource_ids.length > 0
  ) {
    try {
      const [_, count] =
        await bookingModuleService.listAndCountBookingResources({
          id: {
            $in: bookingRule.booking_resource_ids,
          },
        });
      booking_resources_count = count ?? 0;
    } catch {
      // Resource may be deleted; leave booking_resources empty
    }
  } else {
    try {
      const [_, count] =
        await bookingModuleService.listAndCountBookingResources();
      booking_resources_count = count ?? 0;
    } catch {
      // Resource may be deleted; leave booking_resources empty
    }
  }

  res.json({
    booking_rule: bookingRule,
    booking_resources_count: booking_resources_count,
  });
}

export async function POST(
  req: MedusaRequest<PostAdminBookingRuleBody>,
  res: MedusaResponse,
) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);
  const id = req.params.id as string;
  const body = req.body;

  const [updated] = await bookingModuleService.updateBookingRules([
    {
      id,
      ...(body.scope !== undefined && { scope: body.scope }),
      ...(body.booking_resource_ids !== undefined && {
        booking_resource_ids: body.booking_resource_ids,
      }),
      ...(body.require_payment !== undefined && {
        require_payment: body.require_payment,
      }),
      ...(body.require_confirmation !== undefined && {
        require_confirmation: body.require_confirmation,
      }),
      ...(body.reservation_ttl_seconds !== undefined && {
        reservation_ttl_seconds: body.reservation_ttl_seconds,
      }),
      ...(body.configuration !== undefined && {
        configuration: body.configuration,
      }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.is_active !== undefined && { is_active: body.is_active }),
      ...(body.valid_from !== undefined && {
        valid_from: body.valid_from ? new Date(body.valid_from) : null,
      }),
      ...(body.valid_until !== undefined && {
        valid_until: body.valid_until ? new Date(body.valid_until) : null,
      }),
    },
  ]);

  res.json({ booking_rule: updated });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);
  const id = req.params.id as string;

  await bookingModuleService.deleteBookingRules([id]);
  res.status(200).json({
    id,
    object: "booking_rule",
    deleted: true,
  });
}

export const AUTHENTICATE = true;
