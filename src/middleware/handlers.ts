import { NextFunction, Request, Response } from "express";
import { authorization, validateAccessToken } from "./authorization";
import { runWithContext } from "./context";
import { withHandler } from "../api/wrapper";

export async function handleSetupRequestContext(req: Request, res: Response, next: NextFunction) {
  await withHandler(
    req, res, next,
    {
      handlerName: "handleSetupRequestContext",
      service: "middleware",
      setupContext: true
    },
    (req, res, next, context) => {
      runWithContext(context, next);
    }
  )
}

export async function handleValidateAccessToken(req: Request, res: Response, next: NextFunction) {
  await withHandler(
    req, res, next,
    {
      handlerName: "handleValidateAccessToken",
      service: "middleware"
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

export async function handleAuthorization(req: Request, res: Response, next: NextFunction, roles: string[]) {
  await withHandler(
    req, res, next,
    {
      handlerName: "handleAuthorization",
      service: "middleware"
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

export async function unhandeledRoutes(req: Request, res: Response, next: NextFunction) {
  await withHandler(
    req, res, next,
    {
      handlerName: "unhandeledRoutes",
      service: "middleware"
    },
    (req, res, next, context) => {
      res.status(404).json({ error: `Route '${req.originalUrl}' not found.` });
      next();
    }
  )
}

