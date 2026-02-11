import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import BookingModuleService from "../../../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../../../modules/booking";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const bookingModuleService: BookingModuleService =
    req.scope.resolve(BOOKING_MODULE);

  await bookingModuleService.deleteBookingResourceAllocations(
    req.params.allocationId,
  );
  res.json();
}

export const AUTHENTICATE = true;
