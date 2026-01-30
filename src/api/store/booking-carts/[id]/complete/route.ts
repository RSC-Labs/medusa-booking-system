import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createCartWorkflow, CreateCartWorkflowInput } from "@medusajs/medusa/core-flows";
import completeBookingCartWorkflow from "../../../../../workflows/booking-cart/completeBookingCart";
import acceptNoPaymentCart from "../../../../../workflows/booking-cart/acceptNoPaymentCart";
import BookingModuleService from "../../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../../modules/booking";
import { Modules } from "@medusajs/framework/utils";

export async function POST (
  req: MedusaRequest,
  res: MedusaResponse
) {

  await acceptNoPaymentCart(req.scope).run({
    input: {
      cartId: req.params.id
    }
  })

  const { result } = await completeBookingCartWorkflow(req.scope).run({
    input: {
      cartId: req.params.id,
    } 
  })

  res.json(result)
}

export const AUTHENTICATE = false