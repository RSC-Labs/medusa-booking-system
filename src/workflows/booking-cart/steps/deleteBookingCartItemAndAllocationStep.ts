import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { BOOKING_MODULE } from "../../../modules/booking";
import BookingModuleService from "../../../modules/booking/service";

type StepInput = {
  bookingCartItemId: string;
  bookingResourceAllocationId: string;
};

const deleteBookingCartItemAndAllocationStep = createStep(
  "step-delete-booking-cart-item-and-allocation",
  async (
    { bookingCartItemId, bookingResourceAllocationId }: StepInput,
    { container },
  ) => {
    const bookingModuleService: BookingModuleService =
      container.resolve(BOOKING_MODULE);

    await bookingModuleService.deleteBookingResourceAllocations(
      bookingResourceAllocationId,
    );

    await bookingModuleService.deleteBookingCartItems(bookingCartItemId);

    return new StepResponse();
  },
);

export default deleteBookingCartItemAndAllocationStep;

