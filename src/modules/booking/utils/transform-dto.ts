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
        // Core prices are stored in minor units (e.g. cents).
        // Expose them to the admin UI as major units for easier editing.
        amount: price.amount / 100,
        currency_code: price.currency_code,
      }),
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