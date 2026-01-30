// import { ResolvedSettings, SettingsResolutionContext } from "../types/settings"

// export class BookingSettingService {

//   private async fetchApplicableSettings(
//     context: SettingsResolutionContext
//   ): Promise<any[]> {

//     // const now = context.evaluationTime || new Date()

//     // const filters: any = {
//     //   is_active: true,
//     //   $or: []
//     // }

//     // filters.$or.push({ scope: "global" })

//     // // Resource-specific settings
//     // if (context.bookingResourceId) {
//     //   filters.$or.push({
//     //     scope: "resource",
//     //     booking_resource_id: context.bookingResourceId
//     //   })
//     // }

//     // if (context.bookingId) {
//     //   filters.$or.push({
//     //     scope: "booking",
//     //     booking_id: context.bookingId
//     //   })
//     // }

//     // const settings = await this.bookingModuleService_.listBookingSettings({
//     //   filters: filters
//     // })

//     // // Filter by valid date range
//     // return settings.filter(setting => {
//     //   if (setting.valid_from && new Date(setting.valid_from) > now) {
//     //     return false
//     //   }
//     //   if (setting.valid_until && new Date(setting.valid_until) < now) {
//     //     return false
//     //   }
//     //   return true
//     // })
//   }

//   async resolve(
//     context: SettingsResolutionContext
//   ): Promise<ResolvedSettings> {

//     // return this.mergeSettings(applicableSettings)
//   }

//   evaluateSettings(
//     bookingResourceId?: string,
//     startDate?: Date,
//     endDate?: Date,
//   ) {

//   }
// }
