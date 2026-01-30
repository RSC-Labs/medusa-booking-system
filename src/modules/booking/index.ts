import BookingModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const BOOKING_MODULE = "bookingModule"

export default Module(BOOKING_MODULE, {
  service: BookingModuleService,
})