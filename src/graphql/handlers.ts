import { NextFunction, Request, Response } from "express";

import { rebuildSchema } from "./yoga";
import { withHandler } from "../api/wrapper";

export async function handleGraphQLUpdateSchema(req: Request, res: Response, next: NextFunction) {
  await withHandler(
    req, res, next,
    {
      handlerName: "handleGraphQLUpdateSchema",
      service: "graphql"
    },
    async (req, res, next, context) => {
      await rebuildSchema(true);
      res.status(200);
    }
  )
}
