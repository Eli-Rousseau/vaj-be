import { NextFunction, Request, Response } from "express";

import { withHandler } from "@/src/be/api/wrapper";
import * as main from "@/src/be/api/service/graphql/index";

export async function handleUpdateSchema(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {
      await main.updateSchema();
      res.status(200).json({});
    },
  );
}
