import { NextFunction, Request, Response } from "express";

import { rebuildSchema } from "@/src/graphql/yoga";
import { withHandler } from "@/src/api/wrapper";

export async function handleGraphQLUpdateSchema(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    {
      handlerName: "handleGraphQLUpdateSchema",
      service: "graphql",
    },
    async (req, res, next, context) => {
      await rebuildSchema(true);
      res.sendStatus(200);
    },
  );
}
