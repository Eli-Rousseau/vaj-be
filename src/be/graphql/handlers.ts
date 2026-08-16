import { NextFunction, Request, Response } from "express";

import { rebuildSchema } from "@/src/be/graphql/yoga";
import { withHandler } from "@/src/be/api/wrapper";

export async function handleGraphQLUpdateSchema(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {
      await rebuildSchema(true);
      res.sendStatus(200);
    },
  );
}
