import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { BOOKING_MODULE } from "../../../modules/booking";
import BookingModuleService from "../../../modules/booking/service";

type StepInput = {
  bookingCartItemId: string;
};

const retrieveBookingCartItemStep = createStep(
  "step-retrieving-booking-cart-item",
  async ({ bookingCartItemId }: StepInput, { container }) => {
    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE);

    const bookingCartItem =
      await bookingModuleService.retrieveBookingCartItem(bookingCartItemId, {
        relations: ["booking_resource_allocation"],
      });

    return new StepResponse(bookingCartItem);
  },
);

export default retrieveBookingCartItemStep;

