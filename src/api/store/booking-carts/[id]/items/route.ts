import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";
import BookingModuleService from "../../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../../modules/booking";
import { Modules } from "@medusajs/framework/utils";

type PostBookingCartsType = {
  booking_resource_id: string;
  start_date: Date;
  end_date: Date;
};

export async function POST(
  req: MedusaRequest<PostBookingCartsType>,
  res: MedusaResponse,
) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  const pricingConfigs =
    await bookingModuleService.listBookingResourcePricingConfigs({
      booking_resource_id: req.body.booking_resource_id,
    });

  // TODO: Add acquire lock
  const bookingResourceAllocation =
    await bookingModuleService.createBookingResourceAllocations({
      booking_resource_id: req.body.booking_resource_id,
      start_time: req.body.start_date,
      end_time: req.body.end_date,
      status: "hold",
    });
  await addToCartWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      items: [
        {
          variant_id: pricingConfigs[0].product_variant_id,
          quantity: 1,
        },
      ],
    },
  });

  const cartModule = req.scope.resolve(Modules.CART);

  const result = await cartModule.listLineItems({
    cart_id: req.params.id,
    variant_id: pricingConfigs[0].product_variant_id,
  });

  const bookingCartItem = await bookingModuleService.createBookingCartItems({
    cart_id: req.params.id as string,
    cart_line_item_id: result[0].id,
    booking_resource_allocation: bookingResourceAllocation.id,
    start_time: req.body.start_date,
    end_time: req.body.end_date,
    status: "reserved",
  });

  res.json({
    booking_cart_item: bookingCartItem,
    booking_resource_allocation: bookingResourceAllocation,
  });
}

export const AUTHENTICATE = true;
