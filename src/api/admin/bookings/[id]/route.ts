import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import BookingModuleService from "../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../modules/booking";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Retrieve the booking by ID
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);
  const booking = await bookingModuleService.retrieveBooking(req.params.id);

  // Fetch order with customer information if booking has an order_id
  let order: any = null;
  if (booking.order_id) {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["*", "customer.*"],
      filters: {
        id: booking.order_id,
      },
    });

    order = orders[0] || null;
  }

  // Fetch booking line items with their related data
  const [bookingLineItems] =
    await bookingModuleService.listAndCountBookingLineItems(
      {
        booking_id: booking.id,
      },
      {
        relations: ["booking_resource_allocation"],
      },
    );

  // Extract allocation IDs and fetch their booking resources
  const allocationIds = bookingLineItems
    .map((item) => (item as any).booking_resource_allocation?.id)
    .filter((id): id is string => !!id);

  let resourcesMap = new Map<string, any>();
  if (allocationIds.length > 0) {
    const [allocations] =
      await bookingModuleService.listAndCountBookingResourceAllocations(
        {
          id: allocationIds,
        },
        {
          relations: ["booking_resource"],
        },
      );

    // Create map of allocation_id -> allocation with resource
    allocations.forEach((allocation) => {
      resourcesMap.set(allocation.id, allocation);
    });
  }

  // Merge line items with resource data
  const lineItemsWithResources = bookingLineItems.map((lineItem) => {
    const allocationId = (lineItem as any).booking_resource_allocation?.id;

    // Merge allocation with resource if available
    if (allocationId && resourcesMap.has(allocationId)) {
      (lineItem as any).booking_resource_allocation =
        resourcesMap.get(allocationId);
    }

    return lineItem;
  });

  // Merge booking with its corresponding order and line items
  const bookingWithOrder = {
    ...booking,
    order: order,
    booking_line_items: lineItemsWithResources,
  };

  res.json({
    booking: bookingWithOrder,
  });
}

export const AUTHENTICATE = true;
