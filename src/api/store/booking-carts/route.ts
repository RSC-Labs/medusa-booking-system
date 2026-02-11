import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  createCartWorkflow,
  CreateCartWorkflowInput,
} from "@medusajs/medusa/core-flows";

export async function POST(
  req: MedusaRequest<CreateCartWorkflowInput>,
  res: MedusaResponse,
) {
  const { result } = await createCartWorkflow(req.scope).run({
    input: req.body,
  });

  res.json(result);
}

export const AUTHENTICATE = true;
