import { Logger } from "@medusajs/framework/types"
import { PgConnectionType } from "./utils/types";
import { MedusaService } from "@medusajs/framework/utils"
import Booking, {} from "./models/booking"
import BookingResource from "./models/bookingResource";
import BookingLineItem from "./models/bookingLineItem";
import BookingResourceAllocation from "./models/bookingResourceAllocation";
import BookingResourceAvailabilityRule from "./models/bookingResourceAvailabilityRule";
import BookingResourcePricingConfig from "./models/bookingResourcePricingConfig";
import BookingSetting from "./models/bookingSetting";

import { BookingAvailability, BookingAvailabilityService } from "./services";
import { BookingResourceType } from "./types/booking";
import BookingCartItem from "./models/bookingCartItem";

type InjectedDependencies = {
  bookingAvailabilityService: BookingAvailabilityService,
}

class BookingModuleService extends MedusaService({
  Booking,
  BookingResource,
  BookingSetting,
  BookingCartItem,
  BookingLineItem,
  BookingResourceAllocation,
  BookingResourceAvailabilityRule,
  BookingResourcePricingConfig
}) {

  protected bookingAvailabilityService_: BookingAvailabilityService

  constructor({ bookingAvailabilityService }: InjectedDependencies) {
    super(...arguments)
    this.bookingAvailabilityService_ = bookingAvailabilityService
  }

  getAvailability(
    resource: BookingResourceType,
    from: Date,
    to: Date,
    view: "month" | "week" | "day"
  ) : BookingAvailability[] {
    return this.bookingAvailabilityService_.getAvailability(
      resource,
      from,
      to,
      view
    )
  }
}

export default BookingModuleService
