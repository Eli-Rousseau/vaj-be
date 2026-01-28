import { Request, Response } from "express";
import { rebuildSchema } from "./yoga";

export async function handleGraphQLUpdateSchema(req: Request, res: Response) {
  await rebuildSchema(true);
  res.status(200).end();
}
