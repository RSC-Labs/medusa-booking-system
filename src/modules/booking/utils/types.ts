import { ModulesSdkUtils } from "@medusajs/framework/utils"

export type PgConnectionType = ReturnType<typeof ModulesSdkUtils.createPgConnection>;
