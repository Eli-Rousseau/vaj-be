import { NextFunction, Request, Response } from "express";

import * as main from "@/src/be/api/service/authentication/index";
import { withHandler } from "@/src/be/api/wrapper";

export async function handleRegister(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {
      const result = await main.register({
        user: req.body?.user,
        jwtSecret: process.env.JWT_SECRET as string,
      });

      res.status(201).json({
        accessToken: result.accessToken,
        refreshToken: `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`,
      });
    },
  );
}

export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {
      const result = await main.login({
        user: req.body?.user,
        jwtSecret: process.env.JWT_SECRET as string,
      });

      res.status(201).json({
        accessToken: result.accessToken,
        refreshToken: `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`,
      });
    },
  );
}

export async function handleRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {
      const result = await main.refresh({
        tokenReferenceAndHash: req.body?.refreshToken,
        jwtSecret: process.env.JWT_SECRET as string,
      });

      res.status(201).json({
        accessToken: result.accessToken,
        refreshToken: `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`,
      });
    },
  );
}
