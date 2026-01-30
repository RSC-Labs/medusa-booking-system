import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { BOOKING_MODULE } from "../../../modules/booking";
import BookingModuleService from "../../../modules/booking/service";

type StepInput = {
  cartId: string;
};

const retrieveBookingCartItemsStep = createStep(
  "step-retrieving-booking-cart-items",
  async ({ cartId }: StepInput, { container }) => {
    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE);

    const bookingCartItems = await bookingModuleService.listBookingCartItems(
      {
        cart_id: cartId,
      },
      {
        relations: ["booking_resource_allocation"],
      },
    );

    return new StepResponse(bookingCartItems);
  },
);
export default retrieveBookingCartItemsStep;
