import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { BookingResourcePricingConfigType } from "../../../modules/booking/types/booking";

type StepInput = {
  unit: BookingResourcePricingConfigType["unit"];
  pricingConfig: BookingResourcePricingConfigType;
  startDate: Date;
  endDate: Date;
};

const calculateItemQuantityStep = createStep(
  "step-calculate-item-quantity",
  async ({ unit, pricingConfig, startDate, endDate }: StepInput) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (isNaN(start) || isNaN(end) || end <= start) {
      return new StepResponse(0);
    }

    const durationMs = end - start;

    console.log("durationMs", durationMs);

    const msPerUnit: Record<BookingResourcePricingConfigType["unit"], number> =
      {
        second: 1000,
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        // For custom we treat unit_value as a multiplier over seconds.
        custom: 1000,
      };

    console.log("msPerUnit", msPerUnit);

    const baseUnitMs = msPerUnit[unit];

    console.log("baseUnitMs", baseUnitMs);

    // How many "base units" (e.g. minutes, hours, days) the duration spans.
    const rawUnits = durationMs / baseUnitMs;

    console.log("rawUnits", rawUnits);

    // pricingConfig.unit_value defines how many base units make up a single
    // chargeable item; we always round up to at least 1 item.
    const quantity = Math.max(
      1,
      Math.ceil(rawUnits / (pricingConfig.unit_value || 1)),
    );

    console.log("quantity", quantity);

    return new StepResponse(quantity);
  },
);

export default calculateItemQuantityStep;