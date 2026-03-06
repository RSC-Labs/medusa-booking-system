import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import deleteBookingCartItemWorkflow from "../../../../../../workflows/booking-cart/deleteBookingCartItemWorkflow";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await deleteBookingCartItemWorkflow(req.scope).run({
    input: {
      bookingCartItemId: req.params["itemId"],
    },
  });

  res.json({});
}
