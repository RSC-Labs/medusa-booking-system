import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import BookingModuleService from "../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../modules/booking";
import { Modules } from "@medusajs/framework/utils";

type StepInput = {
  cartId: string;
  productVariantId: string;
  bookingResourceAllocationId: string;
  startTime: Date;
  endTime: Date;
};

const stepCreateBookingCartItems = createStep(
  "step-create-booking-cart-items",
  async (
    { cartId, productVariantId, bookingResourceAllocationId, startTime, endTime }: StepInput,
    { container },
  ) => {
    const cartModule = container.resolve(Modules.CART);
    const lineItems = await cartModule.listLineItems({
      cart_id: cartId,
      variant_id: productVariantId,
    });

    // ADR: We do not have info about the cart line item id, so we need to use product variant id.
    // And the same reservation goes to the same Medusa Cart Line Item as quantity.
    // So we need to create new booking cart item for the same Medusa Cart Line Item with new booking resource allocation.

    const bookingModuleService: BookingModuleService = container.resolve(BOOKING_MODULE);
    for (const lineItem of lineItems) {
      await bookingModuleService.createBookingCartItems({
        cart_id: cartId,
        cart_line_item_id: lineItem.id,
        booking_resource_allocation: bookingResourceAllocationId,
        start_time: startTime,
        end_time: endTime,
        status: "reserved",
      });
    }

    return new StepResponse();
  },
);

export default stepCreateBookingCartItems;
