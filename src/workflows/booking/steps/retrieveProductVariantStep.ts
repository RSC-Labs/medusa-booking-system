import { IProductModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type StepInput = {
  productVariantId: string,
}

const retrieveProductVariantStep = createStep(
  "step-retrieving-product-variant", 
  async ({ productVariantId } : StepInput, { container }) => {

    const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT)

    const productVariant = await productModuleService.retrieveProductVariant(productVariantId)

    return new StepResponse(productVariant)
  }
)

export default retrieveProductVariantStep