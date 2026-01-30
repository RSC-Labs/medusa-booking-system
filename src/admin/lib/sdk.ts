// src/admin/lib/sdk.ts (in your plugin)
import Medusa from "@medusajs/js-sdk"

export const medusaSdk = new Medusa({
  baseUrl: __BACKEND_URL__,
  auth: {
    type: "session",
  },
})