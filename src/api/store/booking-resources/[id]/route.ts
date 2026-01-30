import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils";

type GetBookingResourceAvailablityType = {
  startDate?: Date,
  endDate?: Date
}

export async function GET (
  req: MedusaRequest<GetBookingResourceAvailablityType>,
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
      "product.id",
      "product.title",
      "product.subtitle",
      "product.handle",
      "product.description",
      "product.thumbnail",
      "booking_resource_pricing_configs.product_variant.calculated_price.*"
    ],
    filters: {
      id: req.params.id
    },
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

  const response = {
      bookingResource: bookingResources[0],
      product: bookingResources[0].product ?? undefined,
  }

  res.json(response)
}

export const AUTHENTICATE = false