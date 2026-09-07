import { NextFunction, Request, Response } from "express";

import { withHandler } from "@/src/be/api/wrapper";

export async function getFile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {
        req.params.sequentialId;
    },
  );
}

export async function uploadFile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {},
  );
}

export async function deleteFile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {},
  );
}