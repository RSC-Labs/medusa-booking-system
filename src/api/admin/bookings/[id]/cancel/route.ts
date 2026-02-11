import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import cancelAdminBookingWorkflow from "../../../../../workflows/booking/cancelAdminBooking";

type CancelAdminBookingType = {};

export async function POST(
  req: MedusaRequest<CancelAdminBookingType>,
  res: MedusaResponse,
) {
  const { result } = await cancelAdminBookingWorkflow(req.scope).run({
    input: {
      bookingId: req.params.id,
    },
  });

  res.json(result);
}

export const AUTHENTICATE = true;
