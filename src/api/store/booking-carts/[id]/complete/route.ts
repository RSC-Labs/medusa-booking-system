import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import completeBookingCartWorkflow from "../../../../../workflows/booking-cart/completeBookingCart";
import acceptNoPaymentCart from "../../../../../workflows/booking-cart/acceptNoPaymentCart";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  await acceptNoPaymentCart(req.scope).run({
    input: {
      cartId: req.params.id,
    },
  });

  const { result } = await completeBookingCartWorkflow(req.scope).run({
    input: {
      cartId: req.params.id,
    },
  });

  res.json({
    result: result ?? null,
  });
}
