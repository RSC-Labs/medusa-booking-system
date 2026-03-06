import { createWorkflow, transform, when } from "@medusajs/framework/workflows-sdk";
import { deleteLineItemsWorkflow } from "@medusajs/medusa/core-flows";
import retrieveBookingCartItemStep from "./steps/retrieveBookingCartItemStep";
import deleteBookingCartItemAndAllocationStep from "./steps/deleteBookingCartItemAndAllocationStep";
import retrieveBookingCartItemsStep from "./steps/retrieveBookingCartItemsStep";

export type DeleteBookingCartItemWorkflowInput = {
  bookingCartItemId: string;
};

const deleteBookingCartItemWorkflow = createWorkflow(
  "delete-booking-cart-item",
  function (input: DeleteBookingCartItemWorkflowInput) {
    const bookingCartItem = retrieveBookingCartItemStep({
      bookingCartItemId: input.bookingCartItemId,
    });

    const cartId = transform({ bookingCartItem }, (data) => {
      return data.bookingCartItem.cart_id;
    });

    const cartLineItemId = transform({ bookingCartItem }, (data) => {
      return data.bookingCartItem.cart_line_item_id;
    });

    const bookingResourceAllocationId = transform(
      { bookingCartItem },
      (data) => {
        return data.bookingCartItem.booking_resource_allocation.id;
      },
    );

    const bookingCartItems = retrieveBookingCartItemsStep({
      cartId,
    });

    const bookingCartItemsForLineItem = transform(
      { bookingCartItems, cartLineItemId },
      (data) => {
        return data.bookingCartItems.filter((item) => {
          return item.cart_line_item_id === data.cartLineItemId;
        });
      },
    );

    when(
      { bookingCartItemsForLineItem },
      ({ bookingCartItemsForLineItem }) => {
        return bookingCartItemsForLineItem.length === 1;
      },
    ).then(() => {
      deleteLineItemsWorkflow.runAsStep({
        input: {
          cart_id: cartId,
          ids: [cartLineItemId],
        },
      });
    });

    deleteBookingCartItemAndAllocationStep({
      bookingCartItemId: input.bookingCartItemId,
      bookingResourceAllocationId,
    });
  },
);

export default deleteBookingCartItemWorkflow;

