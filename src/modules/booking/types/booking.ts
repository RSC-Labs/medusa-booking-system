import { InferTypeOf } from "@medusajs/framework/types"
import BookingResource from "../models/bookingResource"
import BookingResourceAvailabilityRule from "../models/bookingResourceAvailabilityRule"
import BookingResourcePricingConfig from "../models/bookingResourcePricingConfig"
import BookingResourceAllocation from "../models/bookingResourceAllocation"
import BookingCartItem from "../models/bookingCartItem"
import BookingLineItem from "../models/bookingLineItem"

export type BookingResourceType = InferTypeOf<typeof BookingResource>
export type BookingResourceAvailabilityRuleType = InferTypeOf<typeof BookingResourceAvailabilityRule>
export type BookingResourceAllocationType = InferTypeOf<typeof BookingResourceAllocation>
export type BookingResourcePricingConfigType = InferTypeOf<typeof BookingResourcePricingConfig>
export type BookingCartItemType = InferTypeOf<typeof BookingCartItem>
export type BookingLineItemType = InferTypeOf<typeof BookingLineItem>