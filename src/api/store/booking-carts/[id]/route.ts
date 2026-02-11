import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CreateAddressDTO } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import BookingModuleService from "../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../modules/booking";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cartModule = req.scope.resolve(Modules.CART);

  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  res.json({
    cart: await cartModule.retrieveCart(req.params.id),
    booking_line_items: await bookingModuleService.listBookingCartItems({
      cart_id: req.params.id,
    }),
  });
}

type UpdateBookingCartType = {
  customer_email?: string;
  customer_address?: CreateAddressDTO;
};

export async function POST(
  req: MedusaRequest<UpdateBookingCartType>,
  res: MedusaResponse,
) {
  const cartModule = req.scope.resolve(Modules.CART);

  const updatedCart = await cartModule.updateCarts([
    {
      id: req.params.id,
      email: req.body.customer_email,
      billing_address: req.body.customer_address,
      shipping_address: req.body.customer_address,
    },
  ]);
  res.json({ cart: updatedCart[0] });
}

export const AUTHENTICATE = true;
