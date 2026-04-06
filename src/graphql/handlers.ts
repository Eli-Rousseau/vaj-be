import { ServerRequest, ServerResponse } from "../api/server";
import { rebuildSchema } from "./yoga";

export async function handleGraphQLUpdateSchema(req: ServerRequest, res: ServerResponse) {
  await rebuildSchema(true);
  res.status(200);
}
