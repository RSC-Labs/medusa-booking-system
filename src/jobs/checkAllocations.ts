import { MedusaContainer } from "@medusajs/framework/types";
import checkExpiredAllocationsWorkflow from "../workflows/booking-resource-allocation/checkExpiredAllocations";

export default async function checkAllocations(container: MedusaContainer) {
  await checkExpiredAllocationsWorkflow(container).run();
}

export const config = {
  name: "check-expired-allocations",
  schedule: "0 * * * *", // Every hour
};
