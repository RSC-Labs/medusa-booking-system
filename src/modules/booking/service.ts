import { Logger } from "@medusajs/framework/types";
import { PgConnectionType } from "./utils/types";
import { MedusaService } from "@medusajs/framework/utils";
import Booking from "./models/booking";
import BookingResource from "./models/bookingResource";
import BookingLineItem from "./models/bookingLineItem";
import BookingResourceAllocation from "./models/bookingResourceAllocation";
import BookingResourceAvailabilityRule from "./models/bookingResourceAvailabilityRule";
import BookingResourcePricingConfig from "./models/bookingResourcePricingConfig";
import BookingRule from "./models/bookingRule";

import {
  BookingAvailability,
  BookingAvailabilityService,
  resolveRules,
} from "./services";
import { BookingResourceType, BookingRuleType } from "./types/booking";
import { ResolvedRules, DEFAULT_RULES } from "./types/rules";
import BookingCartItem from "./models/bookingCartItem";

type InjectedDependencies = {
  bookingAvailabilityService: BookingAvailabilityService;
};

class BookingModuleService extends MedusaService({
  Booking,
  BookingResource,
  BookingRule,
  BookingCartItem,
  BookingLineItem,
  BookingResourceAllocation,
  BookingResourceAvailabilityRule,
  BookingResourcePricingConfig,
}) {
  protected bookingAvailabilityService_: BookingAvailabilityService;

  constructor({ bookingAvailabilityService }: InjectedDependencies) {
    super(...arguments);
    this.bookingAvailabilityService_ = bookingAvailabilityService;
  }

  getAvailability(
    resource: BookingResourceType,
    from: Date,
    to: Date,
    view: "month" | "week" | "day",
  ): BookingAvailability[] {
    return this.bookingAvailabilityService_.getAvailability(
      resource,
      from,
      to,
      view,
    );
  }

  async resolveRules(
    evaluationTime: Date,
    bookingResourceId?: string,
    bookingId?: string,
  ): Promise<ResolvedRules> {
    const rules = await this.listBookingRules({});
    const context = {
      bookingResourceId,
      bookingId,
      evaluationTime,
    };
    return resolveRules(rules as BookingRuleType[], context);
  }
}

export default BookingModuleService;
