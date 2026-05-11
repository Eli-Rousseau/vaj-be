import { NextFunction, RequestHandler, Request, Response } from "express";
import { authorization, validateAccessToken } from "./authorization";
import { runWithContext } from "./context";
import { withHandler } from "../api/wrapper";

export function handleSetupRequestContext(req: Request, res: Response, next: NextFunction) {
  withHandler(
    {
      handlerName: "handleSetupRequestContext",
      service: "middleware",
      logBody: true,
      setupContext: true
    },
    (req, res, next, context) => {
      runWithContext(context, next);
    }
  )
}

export async function handleValidateAccessToken(req: Request, res: Response, next: NextFunction) {
  withHandler(
    {
      handlerName: "handleValidateAccessToken",
      service: "middleware",
      logBody: true
    },
    (req, res, next, context) => {
      const result = validateAccessToken({
        accessToken: req.header("Authorization") as string,
        jwtSecret: process.env.JWT_SECRET as string
      });

      context.setAttribute("user", result.user);
      next();
    }
  )
}

export const handleAuthorization = (roles: string[]): RequestHandler => {
  return withHandler(
    {
      handlerName: "handleAuthorization",
      service: "middleware",
      logBody: true
    },
    (req, res, next, context) => {
      authorization({
        userRole: (req as any)?.user?.systemRole as string,
        authorizedRoles: roles
      });
      next();
    }
  )
};

export function unhandeledRoutes(req: Request, res: Response, next: NextFunction) {
  withHandler(
    {
      handlerName: "unhandeledRoutes",
      service: "middleware",
      logBody: true
    },
    (req, res, next, context) => {
      res.status(404).json({ error: `Route '${req.originalUrl}' not found.` });
      next();
    }
  )
}

