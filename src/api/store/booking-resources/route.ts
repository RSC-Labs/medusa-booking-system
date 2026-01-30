import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils";


export async function GET (
  req: MedusaRequest,
  res: MedusaResponse
) {

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  const { data: bookingResources } = await query.graph({
    entity: "booking_resource",
    fields: [
      "id",
      "resource_type",
      "is_bookable",
      "pricing_unit",
      "pricing_unit_value",
      "product_title",
      "product.id",
      "product.title",
      "product.subtitle",
      "product.handle",
      "product.description",
      "product.thumbnail",
      "booking_resource_pricing_configs.product_variant.calculated_price.*"
    ],
    context: {
    booking_resource_pricing_configs: {
        product_variant: {
          calculated_price: QueryContext({
            currency_code: "usd",
          }),
        },
      },
    },
  })

  const response = bookingResources.map(bookingResource => {
    return {
      booking_resource: bookingResource,
      product: bookingResource.product ?? undefined,
    }
  })

  res.json(response)
}

export const AUTHENTICATE = false