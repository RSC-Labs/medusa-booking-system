import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import BookingModuleService from "../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../modules/booking";
import {
  BookingResourceAvailabilityRuleType,
  BookingResourcePricingConfigType,
  BookingResourceType,
  BookingRuleType,
} from "../../../../modules/booking/types/booking";
import {
  BookingResourcePricing,
  BookingResourceProductDetails,
} from "../../../../modules/booking/types/api";
import deleteBookingResourceWorkflow from "../../../../workflows/booking-resource/deleteBookingResource";
import { transformToBookingPricingApi } from "../../../../modules/booking/utils/transform-dto";
import updateBookingResourceWorkflow from "../../../../workflows/booking-resource/updateBookingResource";

/** Minimal rule shape returned for "rules applied to this resource" on resource detail. */
export type BookingRuleSummaryType = Pick<
  BookingRuleType,
  "id" | "name" | "scope" | "priority" | "is_active"
>;

type GetAdminBookingResourceType = {
  booking_resource: BookingResourceType;
  booking_resource_availability_rules: BookingResourceAvailabilityRuleType[];
  booking_resource_pricing_configs: {
    config: BookingResourcePricingConfigType;
    pricing: BookingResourcePricing[];
  }[];
  booking_rules: BookingRuleSummaryType[];
};

type PostAdminBookingResourceType = {
  booking_resource: Omit<
    BookingResourceType,
    | "booking_resource_availability_rules"
    | "booking_resource_pricing_configs"
    | "booking_resource_allocations"
  >;
  booking_resource_product_details?: BookingResourceProductDetails;
};

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse<GetAdminBookingResourceType>,
) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);
  const bookingResource = await bookingModuleService.retrieveBookingResource(
    req.params.id,
    {
      relations: [
        "booking_resource_availability_rules",
        "booking_resource_pricing_configs",
        "booking_resource_allocations",
      ],
    },
  );

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["*", "variants.*", "variants.prices.*"],
    filters: {
      id: bookingResource.product_id,
    },
  });

  const resourceId = req.params.id as string;
  const affectedRules = await bookingModuleService.listBookingRules({
    $or: [
      {
        scope: "global",
      },
      {
        scope: "resource",
        booking_resource_ids: {
          $overlap: [resourceId],
        },
      },
    ],
  });

  res.json({
    booking_resource: bookingResource,
    booking_resource_availability_rules:
      bookingResource.booking_resource_availability_rules,
    booking_resource_pricing_configs: transformToBookingPricingApi(
      products[0].variants,
      bookingResource.booking_resource_pricing_configs,
    ),
    booking_rules: affectedRules as BookingRuleSummaryType[],
  });
}

export async function POST(
  req: MedusaRequest<PostAdminBookingResourceType>,
  res: MedusaResponse,
) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  const bookingResourceOld = await bookingModuleService.retrieveBookingResource(
    req.params.id,
  );

  await updateBookingResourceWorkflow(req.scope).run({
    input: {
      bookingResource: {
        ...req.body.booking_resource,
        product_id: bookingResourceOld.product_id,
      },
    },
  });

  const bookingResourceNew = await bookingModuleService.retrieveBookingResource(
    req.params.id,
  );

  res.json({
    booking_resource: bookingResourceNew,
  });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  const bookingResource = await bookingModuleService.retrieveBookingResource(
    req.params.id,
  );
  const { result } = await deleteBookingResourceWorkflow(req.scope).run({
    input: {
      bookingResource: bookingResource,
    },
  });
  res.json(result);
}

export const AUTHENTICATE = true;
