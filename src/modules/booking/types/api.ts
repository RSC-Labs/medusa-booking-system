
export type BookingResourcePricing = {
  amount: number
  currency_code: string
}

export type BookingResourcePricingMap = Map<string, BookingResourcePricing>


export type BookingResourceProductDetails = {
  handle?: string
}