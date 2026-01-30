// import { createWorkflow, transform, when } from "@medusajs/framework/workflows-sdk"
// import { BookingResourcePricing } from "../../modules/booking/types/api"
// import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
// import stepRetrieveBookingResource from "./steps/retrieveBookingResourceStep"

// export type UpdateBookingResourcePricingWorkflowInput = {
//   bookingResourceId: string,
//   bookingResourcePricing: BookingResourcePricing
// }

// const updateBookingResourcePricingWorkflow = createWorkflow(
//   "update-booking-resource-pricing",
//   function (input: UpdateBookingResourcePricingWorkflowInput) {

//     const bookingResource = stepRetrieveBookingResource({
//       bookingResourceId: input.bookingResourceId
//     })
//     const productId = transform(
//       { bookingResource },
//       (data) => data.bookingResource.product_id
//     )

//     const variantPrices = transform(
//       { input },
//       (data) => {
//         return data.input.bookingResourcePricing.base_prices.map((price) => {
//           return {
//             amount: price.amount,
//             currency_code: price.currency_code
//           }
//         })
//       }) 

//     updateProductVariantsWorkflow.runAsStep({
//       input: {
//         selector: {
//           id: productVariantId
//         },
//         update: {
//           prices: variantPrices
//         }
//       }
//     })
    
//   }
// )

// export default updateBookingResourcePricingWorkflow