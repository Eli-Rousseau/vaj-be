import { NextFunction, Request, Response } from "express";

import { registerUser } from "./register";
import { handleAPIError } from "../api/api-errors";
import { loginUser } from "./login";
import { refreshToken } from "./refresh";
import { withHandler } from "../api/wrapper";

export async function handleInternalRegister(req: Request, res: Response, next: NextFunction) {
  await withHandler(
    req, res, next,
    {
      handlerName: "handleInternalRegister",
      service: "authentication"
    },
    async (req, res, next, context) => {
      try {
        const result = await registerUser({
          user: req.body?.user,
          jwtSecret: process.env.JWT_SECRET as string
        });

        res.status(201).json({ 
          "accessToken": result.accessToken,
          "refreshToken": `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`
        });
      } catch (error) {
        handleAPIError(res, error);
      }
    }
  )
}

export async function handleInternalLogin(req: Request, res: Response, next: NextFunction) {
  await withHandler(
    req, res, next,
    {
      handlerName: "handleInternalLogin",
      service: "authentication"
    },
    async (req, res, next, context) => {
      try {
        const result = await loginUser({
          user: req.body?.user,
          jwtSecret: process.env.JWT_SECRET as string
        });

        res.status(201).json({ 
          "accessToken": result.accessToken,
          "refreshToken": `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`
        });
      } catch (error) {
        handleAPIError(res, error);
      }
    }
  )
}

export async function handleRefreshToken(req: Request, res: Response, next: NextFunction) {
  await withHandler(
    req, res, next,
    {
      handlerName: "handleRefreshToken",
      service: "authentication"
    },
    async (req, res, next, context) => {
      try {
      const result = await refreshToken({
        tokenReferenceAndHash: req.body?.refreshToken,
        jwtSecret: process.env.JWT_SECRET as string
      });

      res.status(201).json({
        "accessToken": result.accessToken,
        "refreshToken": `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`
      })
      } catch (error) {
        handleAPIError(res, error);
      }
    }
  )
}