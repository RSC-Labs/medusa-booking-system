import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import BookingModuleService from "../../../../../modules/booking/service"
import { BOOKING_MODULE } from "../../../../../modules/booking"
import { BookingResourceType } from "../../../../../modules/booking/types/booking"
import updateBookingResourceWorkflow from "../../../../../workflows/booking-resource/updateBookingResource"

type PostAdminBookingResourcePublishType = {
  status: "published" | "draft"
}
export async function POST (
  req: MedusaRequest<PostAdminBookingResourcePublishType>,
  res: MedusaResponse
) {

  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );

  const bookingResourceOld: BookingResourceType = await bookingModuleService.retrieveBookingResource(req.params.id);

  await updateBookingResourceWorkflow(req.scope).run({
    input: {
      bookingResource: {
        ...bookingResourceOld,
        status: req.body.status
      }
    }
  })

  const bookingResourceNew: BookingResourceType = await bookingModuleService.retrieveBookingResource(req.params.id);

  res.json({
    booking_resource: bookingResourceNew
  })
}