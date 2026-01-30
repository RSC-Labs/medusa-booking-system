import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ICartModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

type StepInput = {
  cartId: string;
};

const retrieveCartStep = createStep(
  "step-retrieving-cart",
  async ({ cartId }: StepInput, { container }) => {
    const cartModuleService: ICartModuleService = container.resolve(
      Modules.CART,
    );

    const cart = await cartModuleService.retrieveCart(cartId);

    return new StepResponse(cart);
  },
);
export default retrieveCartStep;
