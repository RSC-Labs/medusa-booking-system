import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import BookingModuleService from "../../../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../../../modules/booking";
import { deleteLineItemsWorkflow } from "@medusajs/medusa/core-flows";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  // TODO: Change to workflow

  const { booking_resource_allocation } =
    await bookingModuleService.retrieveBookingCartItem(req.params["itemId"]);

  const booking_cart_item = await bookingModuleService.retrieveBookingCartItem(
    req.params["itemId"],
  );

  deleteLineItemsWorkflow(req.scope).run({
    input: {
      cart_id: booking_cart_item.cart_id,
      ids: [booking_cart_item.cart_line_item_id],
    },
  });

  await bookingModuleService.deleteBookingResourceAllocations(
    booking_resource_allocation.id,
  );

  await bookingModuleService.deleteBookingCartItems(req.params["itemId"]);

  res.json({});
}

export const AUTHENTICATE = true;
