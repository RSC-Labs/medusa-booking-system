import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import holdBookingResourceWorkflow from "../../../../../workflows/booking-resource/holdBookingResource";

type PostBookingResourcesCompleteType = {
  startDate: Date;
  endDate: Date;
};

export async function POST(
  req: MedusaRequest<PostBookingResourcesCompleteType>,
  res: MedusaResponse,
) {
  const { result } = await holdBookingResourceWorkflow(req.scope).run({
    input: {
      bookingResourceId: req.params.id,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    },
  });
  res.json(result);
}

export const AUTHENTICATE = true;
