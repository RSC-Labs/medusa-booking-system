import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import {
  BookingCartItemType,
  BookingResourcePricingConfigType,
  BookingResourceType,
} from "../../../modules/booking/types/booking";
import BookingModuleService from "../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../modules/booking";
import { Modules } from "@medusajs/framework/utils";

type StepInput = {
  cartId: string;
  bookingResourceAllocationId: string;
  startTime: Date;
  endTime: Date;
};

const stepCreateBookingCartItems = createStep(
  "step-create-booking-cart-items",
  async (
    { cartId, bookingResourceAllocationId, startTime, endTime }: StepInput,
    { container },
  ) => {
    const cartModule = container.resolve(Modules.CART);
    const lineItems = await cartModule.listLineItems({
      cart_id: cartId,
    });

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
