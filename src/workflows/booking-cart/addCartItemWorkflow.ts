import { createWorkflow, transform } from "@medusajs/framework/workflows-sdk";
import { CartDTO } from "@medusajs/framework/types";
import {
  acquireLockStep,
  addToCartWorkflow,
  releaseLockStep,
} from "@medusajs/medusa/core-flows";
import stepCreateBookingResourceAllocation from "../common-steps/createBookingResourceAllocationStep";
import retrieveProductVariantStep from "../booking/steps/retrieveProductVariantStep";
import stepRetrievePricingConfigsForBookingResource from "../booking/steps/retrievePricingConfigsForBookingResource";
import createBookingCartItemsStep from "./steps/createBookingCartItemsStep";

export type AddCartItemWorkflowInput = {
  cart: CartDTO;
  bookingResource: {
    id: string;
    startDate: Date;
    endDate: Date;
  };
  context: {
    unit: "second" | "minute" | "hour" | "day" | "custom";
  };
};

const addCartItemWorkflow = createWorkflow(
  "add-cart-item",
  function (input: AddCartItemWorkflowInput) {
    acquireLockStep({
      key: input.cart.id,
      timeout: 5,
      ttl: 5,
    });

    const bookingResourceAllocation = stepCreateBookingResourceAllocation({
      bookingResourceId: input.bookingResource.id,
      startDate: input.bookingResource.startDate,
      endDate: input.bookingResource.endDate,
      status: "confirmed",
      expires_at: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
    });

    const pricingConfigs = stepRetrievePricingConfigsForBookingResource({
      bookingResourceId: input.bookingResource.id,
      unit: input.context.unit,
    });

    const pricingConfig = transform(
      { pricingConfigs },
      (data) => data.pricingConfigs[0],
    );

    const retrievedProductVariant = retrieveProductVariantStep({
      productVariantId: pricingConfig.product_variant_id,
    });

    const productVariant = transform(
      { retrievedProductVariant },
      (data) => data.retrievedProductVariant,
    );

    const itemToAdd = transform(
      { productVariant },
      (data) => data.productVariant,
    );

    addToCartWorkflow.runAsStep({
      input: {
        cart_id: input.cart.id,
        items: [
          {
            variant_id: itemToAdd.id,
            quantity: 1,
          },
        ],
      },
    });

    const bookingResourceAllocationId = transform(
      { bookingResourceAllocation },
      (data) => data.bookingResourceAllocation.id,
    );

    createBookingCartItemsStep({
      cartId: input.cart.id,
      bookingResourceAllocationId: bookingResourceAllocationId,
      startTime: input.bookingResource.startDate,
      endTime: input.bookingResource.endDate,
    });

    releaseLockStep({
      key: input.cart.id,
    });
  },
);

export default addCartItemWorkflow;
