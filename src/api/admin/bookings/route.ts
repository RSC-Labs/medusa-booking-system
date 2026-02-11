import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import BookingModuleService from "../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../modules/booking";
import { CreateCustomerAddressDTO } from "@medusajs/framework/types";
import createAdminBookingWorkflow from "../../../workflows/booking/createAdminBooking";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  // Parse pagination parameters
  const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
  const take = req.query.take ? parseInt(req.query.take as string, 10) : 15;

  // List bookings with pagination
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);
  const [bookings, count] = await bookingModuleService.listAndCountBookings(
    {},
    {
      skip,
      take,
    },
  );

  // Extract all unique order_ids from bookings (filter out null/undefined)
  const orderIds = [
    ...new Set(
      bookings
        .map((booking) => booking.order_id)
        .filter((orderId): orderId is string => !!orderId),
    ),
  ];

  // Extract all booking IDs to fetch line items
  const bookingIds = bookings.map((booking) => booking.id);

  // Fetch orders with customer information if there are any order_ids
  let ordersMap = new Map<string, any>();
  if (orderIds.length > 0) {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "currency_code", "total", "customer.*"],
      filters: {
        id: orderIds,
      },
    });

    // Create a map for quick lookup: order_id -> order
    orders.forEach((order) => {
      ordersMap.set(order.id, order);
    });
  }

  // Fetch booking line items with their related data if there are any bookings
  let bookingLineItemsMap = new Map<string, any[]>();
  if (bookingIds.length > 0) {
    const [bookingLineItems] =
      await bookingModuleService.listAndCountBookingLineItems(
        {
          booking_id: bookingIds,
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

    // Group line items by booking_id and merge resource data
    bookingLineItems.forEach((lineItem) => {
      const bookingId = (lineItem as any).booking_id;
      const allocationId = (lineItem as any).booking_resource_allocation?.id;

      // Merge allocation with resource if available
      if (allocationId && resourcesMap.has(allocationId)) {
        (lineItem as any).booking_resource_allocation =
          resourcesMap.get(allocationId);
      }

      if (!bookingLineItemsMap.has(bookingId)) {
        bookingLineItemsMap.set(bookingId, []);
      }
      bookingLineItemsMap.get(bookingId)!.push(lineItem);
    });
  }

  // Merge bookings with their corresponding orders and line items
  const bookingsWithOrders = bookings.map((booking) => ({
    ...booking,
    order: booking.order_id ? ordersMap.get(booking.order_id) || null : null,
    booking_line_items: bookingLineItemsMap.get(booking.id) || [],
  }));

  res.json({
    bookings: bookingsWithOrders,
    count: count,
    offset: skip,
    limit: take,
  });
}

type PostAdminBookingType = {
  customer: {
    email: string;
    shippingAddress: CreateCustomerAddressDTO;
    billingAddress: CreateCustomerAddressDTO;
  };
  bookingResource: {
    id: string;
    startDate: Date;
    endDate: Date;
  };
  context: {
    unit: "second" | "minute" | "hour" | "day" | "custom";
  };
};

export async function POST(
  req: MedusaRequest<PostAdminBookingType>,
  res: MedusaResponse,
) {
  const { result } = await createAdminBookingWorkflow(req.scope).run({
    input: req.body,
  });

  res.json(result);
}

export const AUTHENTICATE = true;
