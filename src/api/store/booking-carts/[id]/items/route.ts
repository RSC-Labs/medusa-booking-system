import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import BookingModuleService from "../../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../../modules/booking";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import addCartItemWorkflow, {
  type AddCartItemWorkflowInput,
} from "../../../../../workflows/booking-cart/addCartItemWorkflow";

type PostBookingCartsType = {
  booking_resource_id: string;
  start_date: Date;
  end_date: Date;
  pricing_unit: AddCartItemWorkflowInput["context"]["unit"];
};

export async function POST(
  req: MedusaRequest<PostBookingCartsType>,
  res: MedusaResponse,
) {

  const bookingModuleService: BookingModuleService =
  req.scope.resolve(BOOKING_MODULE);

  const cartModule = req.scope.resolve(Modules.CART);

  const cart = await cartModule.retrieveCart(req.params.id);

  await addCartItemWorkflow(req.scope).run({
    input: {
      cart: cart,
      bookingResource: {
        id: req.body.booking_resource_id,
        startDate: req.body.start_date,
        endDate: req.body.end_date,
      },
      context: {
        unit: req.body.pricing_unit,
      },
    },
  });

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [updatedCart] } = await query.graph({
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
    cart: updatedCart,
    booking_line_items: await bookingModuleService.listBookingCartItems({
      cart_id: req.params.id,
    }),
  });
}
