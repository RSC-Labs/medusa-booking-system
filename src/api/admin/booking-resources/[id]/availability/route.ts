import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import BookingModuleService from "../../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../../modules/booking";
import { BookingAvailability } from "../../../../../modules/booking/services";
import { BookingResourceType } from "../../../../../modules/booking/types/booking";

type GetAdminBookingResourceAvailabilityType = {
  from: Date,
  to: Date,
  view: "month" | "week" | "day" | "agenda"
}

type GetAdminBookingResourceAvailabilityResponseType = {
  booking_resource: BookingResourceType,
  availability: BookingAvailability[]
}

export async function GET (
  req: MedusaRequest<GetAdminBookingResourceAvailabilityType>,
  res: MedusaResponse<GetAdminBookingResourceAvailabilityResponseType>
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );
 
  const resource = await bookingModuleService.retrieveBookingResource(
    req.params.id,
    {
      relations: [
        "booking_resource_availability_rules",
        "booking_resource_allocations",
      ],
    }
  )

  const from = new Date(req.query.from as string)
  const to = new Date(req.query.to as string)
  const view = (req.query.view ?? "month") as
    | "month"
    | "week"
    | "day"

  const availability = bookingModuleService.getAvailability(
      resource,
      from,
      to,
      view
  )

  res.json({
    booking_resource: resource,
    availability: availability
    }
  )
}

export const AUTHENTICATE = false