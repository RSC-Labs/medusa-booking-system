import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { CreateCustomerAddressDTO } from "@medusajs/framework/types";
import { createCartWorkflow } from "@medusajs/medusa/core-flows";
import addCartItemWorkflow from "../booking-cart/addCartItemWorkflow";
import completeBookingCartWorkflow from "../booking-cart/completeBookingCart";
import retrieveBookingCartItemsStep from "../booking-cart/steps/retrieveBookingCartItemsStep";
import acceptNoPaymentCart from "../booking-cart/acceptNoPaymentCart";

export type CreateAdminBooking = {
  customer: {
    email: string;
    shippingAddress: CreateCustomerAddressDTO;
    billingAddress: CreateCustomerAddressDTO;
  };
  bookingResource: {
    id: string;
    startDate: Date;
    endDate: Date;
  };
  context: {
    unit: "second" | "minute" | "hour" | "day" | "custom";
  };
};

const createAdminBooking = createWorkflow(
  "create-admin-booking",
  function (input: CreateAdminBooking) {
    const cart = createCartWorkflow.runAsStep({
      input: {
        email: input.customer.email,
      },
    });

    const cartDto = transform({ cart }, (data) => data.cart);

    addCartItemWorkflow.runAsStep({
      input: {
        cart: cartDto,
        bookingResource: input.bookingResource,
        context: input.context,
      },
    });


    acceptNoPaymentCart.runAsStep({
      input: {
        cartId: cartDto.id,
      },
    });

    completeBookingCartWorkflow.runAsStep({
      input: {
        cartId: cartDto.id,
      },
    });

    return new WorkflowResponse({});
  },
);

export default createAdminBooking;
