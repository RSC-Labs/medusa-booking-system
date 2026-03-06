import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils";

type GetBookingResourceAvailablityType = {
  startDate?: Date;
  endDate?: Date;
};

export async function GET(
  req: MedusaRequest<GetBookingResourceAvailablityType>,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

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
      "booking_resource_pricing_configs.product_variant.calculated_price.*",
    ],
    filters: {
      id: req.params.id,
    },
    context: {
      booking_resource_pricing_configs: {
        product_variant: {
          calculated_price: QueryContext({
            region_id: req.query.region_id,
          }),
        },
      },
    },
  });

  const raw = bookingResources[0];

  // Normalize pricing so frontend sees human-readable amounts (e.g. 85 instead of 0.85)
  const bookingResource = {
    ...raw,
    booking_resource_pricing_configs:
      Array.isArray(raw.booking_resource_pricing_configs)
        ? raw.booking_resource_pricing_configs.map((config: any) => {
            const price = config?.product_variant?.calculated_price;
            if (!price || typeof price.calculated_amount !== "number") {
              return config;
            }

            return {
              ...config,
              product_variant: {
                ...config.product_variant,
                calculated_price: {
                  ...price,
                  // Scale up so values like 0.85 become 85 for display.
                  calculated_amount: price.calculated_amount * 100,
                },
              },
            };
          })
        : raw.booking_resource_pricing_configs,
  };

  const response = {
    bookingResource,
    product: bookingResource.product ?? undefined,
  };

  res.json(response);
}
