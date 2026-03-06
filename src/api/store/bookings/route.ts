import type { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import BookingModuleService from "../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../modules/booking";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const customerId = req.auth_context?.actor_id;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
  const take = req.query.take ? parseInt(req.query.take as string, 10) : 20;

  // Fetch orders for this customer so we can scope bookings to them and
  // return basic order information alongside each booking.
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "currency_code", "total", "customer.*", "items.*"],
    filters: {
      customer_id: customerId,
    },
  });

  if (!orders || orders.length === 0) {
    return res.json({
      bookings: [],
      count: 0,
      offset: skip,
      limit: take,
    });
  }

  const orderIds = orders.map((o: any) => o.id);
  const ordersMap = new Map<string, any>();
  orders.forEach((order: any) => {
    ordersMap.set(order.id, order);
  });

  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  const [bookings, count] = await bookingModuleService.listAndCountBookings(
    {
      order_id: orderIds,
    },
    {
      skip,
      take,
    },
  );

  const bookingIds = bookings.map((booking: any) => booking.id);

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

    const allocationIds = bookingLineItems
      .map((item: any) => item.booking_resource_allocation?.id)
      .filter((id: string | undefined): id is string => !!id);

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

      allocations.forEach((allocation: any) => {
        resourcesMap.set(allocation.id, allocation);
      });
    }

    bookingLineItems.forEach((lineItem: any) => {
      const bookingId = lineItem.booking_id;
      const allocationId = lineItem.booking_resource_allocation?.id;

      if (allocationId && resourcesMap.has(allocationId)) {
        lineItem.booking_resource_allocation = resourcesMap.get(allocationId);
      }

      if (!bookingLineItemsMap.has(bookingId)) {
        bookingLineItemsMap.set(bookingId, []);
      }
      bookingLineItemsMap.get(bookingId)!.push(lineItem);
    });
  }

  const bookingsWithOrders = bookings.map((booking: any) => ({
    ...booking,
    order: booking.order_id ? ordersMap.get(booking.order_id) || null : null,
    booking_line_items: bookingLineItemsMap.get(booking.id) || [],
  }));

  console.log("bookingsWithOrders", bookingsWithOrders);
  console.log("bookingsWithOrders[0].order", bookingsWithOrders[0].order.items);

  res.json({
    bookings: bookingsWithOrders,
    count,
    offset: skip,
    limit: take,
  });
}