import { createWorkflow, transform } from "@medusajs/framework/workflows-sdk";
import {
  acquireLockStep,
  completeCartWorkflow,
  CompleteCartWorkflowOutput,
  releaseLockStep,
} from "@medusajs/medusa/core-flows";
import stepConfirmBookingResourceAllocations from "./steps/confirmBookingResourceAllocations";
import stepCreateBooking from "../common-steps/createBooking";
import stepUpdateBooking from "../common-steps/updateBooking";
import stepCalculateBookingDateRange from "../common-steps/calculateBookingDateRange";
import stepCreateAdminBookingLineItems from "../common-steps/createAdminBookingLineItems";
import retrieveBookingCartItemsStep from "./steps/retrieveBookingCartItemsStep";

export type CompleteBookingCartWorkflowInput = {
  cartId: string;
};

const completeBookingCartWorkflow = createWorkflow(
  "complete-booking-cart",
  function (input: CompleteBookingCartWorkflowInput) {
    acquireLockStep({
      key: input.cartId,
      timeout: 5,
      ttl: 5,
    });

    const bookingCartItems = retrieveBookingCartItemsStep({
      cartId: input.cartId,
    });

    const transformedBookingCartItems = transform(
      { bookingCartItems },
      (data) => data.bookingCartItems,
    );

    const cartResult: CompleteCartWorkflowOutput =
      completeCartWorkflow.runAsStep({
        input: {
          id: input.cartId,
        },
      });

    stepConfirmBookingResourceAllocations({
      bookingCartItems: transformedBookingCartItems,
    });

    const orderId = transform({ cartResult }, (data) => data.cartResult.id);

    const timeRanges = transform(
      { bookingCartItems: transformedBookingCartItems },
      (data) =>
        data.bookingCartItems.map((item) => ({
          startTime: item.booking_resource_allocation.start_time,
          endTime: item.booking_resource_allocation.end_time,
        })),
    );

    const calculatedBookingDateRange = stepCalculateBookingDateRange({
      timeRanges: timeRanges,
    });

    const bookingDateRange = transform(
      { calculatedBookingDateRange },
      (data) => data.calculatedBookingDateRange,
    );

    const createdBooking = stepCreateBooking({
      orderId: orderId,
      startDate: bookingDateRange.startDate,
      endDate: bookingDateRange.endDate,
    });

    const bookingId = transform(
      { createdBooking },
      (data) => data.createdBooking.id,
    );

    const bookingResourceAllocationIds = transform(
      { bookingCartItems: transformedBookingCartItems },
      (data) =>
        data.bookingCartItems.map(
          (item) => item.booking_resource_allocation.id,
        ),
    );

    const bookingLineItems = stepCreateAdminBookingLineItems({
      bookingResourceAllocationIds: bookingResourceAllocationIds,
      bookingId: bookingId,
      startDate: bookingDateRange.startDate,
      endDate: bookingDateRange.endDate,
    });

    const lineItems = transform(
      { bookingLineItems },
      (data) => data.bookingLineItems,
    );

    stepUpdateBooking({
      bookingId: bookingId,
      bookingLineItems: lineItems,
    });

    releaseLockStep({
      key: input.cartId,
    });
  },
);

export default completeBookingCartWorkflow;
