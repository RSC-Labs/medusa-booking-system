import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils";

type ListBookingResourcesQuery = {
  handle?: string;
  region_id?: string;
  currency_code?: string;
};

export async function GET(
  req: MedusaRequest<ListBookingResourcesQuery>,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any;

  const { handle, region_id, currency_code } = req.query ?? {};

  if (!region_id && !currency_code) {
    res.status(400).json({
      message: "Either region_id or currency_code query parameter is required",
    });
    return;
  }

  let bookingResources: any[] = [];

  if (handle) {
    // Step 1: resolve product id by handle
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: {
        handle,
      },
    });

    const productId = products?.[0]?.id;

    if (!productId) {
      res.json([]);
      return;
    }

    // Step 2: query booking resources linked to that product
    const result = await query.graph({
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
        "booking_resource_pricing_configs.product_variant.calculated_price.*",
      ],
      filters: {
        product_id: productId,
      },
      context: {
        booking_resource_pricing_configs: {
          product_variant: {
            calculated_price: QueryContext(
              currency_code
                ? {
                    currency_code,
                  }
                : {
                    region_id,
                  },
            ),
          },
        },
      },
    });

    bookingResources = result.data ?? [];
  } else {
    const result = await query.graph({
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
        "booking_resource_pricing_configs.product_variant.calculated_price.*",
      ],
      context: {
        booking_resource_pricing_configs: {
          product_variant: {
            calculated_price: QueryContext(
              currency_code
                ? {
                    currency_code,
                  }
                : {
                    region_id,
                  },
            ),
          },
        },
      },
    });

    bookingResources = result.data ?? [];
  }

  const response = bookingResources.map((bookingResource: any) => {
    return {
      booking_resource: bookingResource,
      product: bookingResource.product ?? undefined,
    };
  });

  res.json(response);
}
