import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  createCartWorkflow,
  CreateCartWorkflowInput,
} from "@medusajs/medusa/core-flows";

export async function POST(
  req: MedusaRequest<CreateCartWorkflowInput>,
  res: MedusaResponse,
) {
  const { region_id, currency_code } = req.body || {};

  if (!region_id && !currency_code) {
    return res.status(400).json({
      message: "Either region_id or currency_code must be provided.",
    });
  }

  console.log("req", req);
  console.log("req.auth_context", (req as any).auth_context);
  const customerId = (req as any).auth_context?.actor_id;

  const { result } = await createCartWorkflow(req.scope).run({
    input: {
      ...req.body,
      ...(customerId
        ? {
            customer_id: customerId,
          }
        : {}),
    },
  });

  res.json({
    cart: result,
  });
}
