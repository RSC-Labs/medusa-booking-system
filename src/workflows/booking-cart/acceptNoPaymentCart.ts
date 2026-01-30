import { createWorkflow, transform } from "@medusajs/framework/workflows-sdk";
import {
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
} from "@medusajs/medusa/core-flows";

export type AcceptNoPaymentCart = {
  cartId: string;
};

const acceptNoPaymentCart = createWorkflow(
  "accept-no-payment-cart",
  function (input: AcceptNoPaymentCart) {
    const paymentCollectionResult =
      createPaymentCollectionForCartWorkflow.runAsStep({
        input: {
          cart_id: input.cartId,
        },
      });

    const paymentCollectionId = transform(
      { paymentCollectionResult },
      (data) => data.paymentCollectionResult.id,
    );

    createPaymentSessionsWorkflow.runAsStep({
      input: {
        payment_collection_id: paymentCollectionId,
        provider_id: "pp_system_default",
      },
    });
  },
);

export default acceptNoPaymentCart;
