import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CartDTO, CreateAddressDTO } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import BookingModuleService from "../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../modules/booking";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [cart] } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "currency_code",
      "total",
      "subtotal",
      "tax_total",
      "discount_total",
      "discount_subtotal",
      "discount_tax_total",
      "original_total",
      "original_tax_total",
      "item_total",
      "item_subtotal",
      "item_tax_total",
      "original_item_total",
      "original_item_subtotal",
      "original_item_tax_total",
      "shipping_total",
      "shipping_subtotal",
      "shipping_tax_total",
      "original_shipping_tax_total",
      "original_shipping_subtotal",
      "original_shipping_total",
      "credit_line_subtotal",
      "credit_line_tax_total",
      "credit_line_total",
      "items.*",
      "shipping_methods.*",
    ],
    filters: {
      id: req.params.id,
    },
  })
  res.json({
    cart: cart,
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
