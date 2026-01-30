import { BookingResourcePricing } from "../types/api";
import { BookingResourcePricingConfigType } from "../types/booking";

export function transformToBookingPricingApi(variants: any[], priceConfigs: BookingResourcePricingConfigType[]): {
  config: BookingResourcePricingConfigType,
  pricing: BookingResourcePricing[]
}[] {
  const variantMap = new Map<string, any>()

  for (const variant of variants) {
    if (variant?.id) {
      variantMap.set(variant.id, variant)
    }
  }

  const result: {
    config: BookingResourcePricingConfigType
    pricing: BookingResourcePricing[]
  }[] = []

  for (const config of priceConfigs) {
    const variant = variantMap.get(config.product_variant_id)

    if (!variant || !Array.isArray(variant.prices)) {
      continue
    }

    const pricing: BookingResourcePricing[] = variant.prices.map(
      (price: any) => ({
        amount: price.amount,
        currency_code: price.currency_code
      })
    )

    result.push({
      config: {
        ...config,
        product_variant_title:
          config.product_variant_title ?? variant.title ?? null
      },
      pricing
    })
  }

  return result
}