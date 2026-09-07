import { NextFunction, Request, Response } from "express";

import * as main from "@/src/be/api/middleware/index";
import { runWithContext } from "@/src/core/context";
import { withHandler } from "@/src/be/api/wrapper";
import { ShopUser } from "@/src/be/database/classes/transformer-classes";

export async function handleSetupRequestContext(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    (req, res, next, context) => {
      runWithContext(context, next);
    },
    {
      setupContext: true,
    }
  );
}

export async function handleValidateAccessToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    (req, res, next, context) => {
      const accessToken = req.header("Authorization") as string;

      const result = main.validateToken({
        accessToken: accessToken,
        jwtSecret: process.env.JWT_SECRET as string,
      });

      context.setAttribute("accessToken", accessToken);
      context.setAttribute("user", result.user);
      next();
    },
  );
}

/**
 * Pass an array as input to determine what role a user must be assigned to
 * authorize the request.
 */
export async function handleAuthorization(
  req: Request,
  res: Response,
  next: NextFunction,
  roles: string[],
) {
  await withHandler(
    req,
    res,
    next,
    (req, res, next, context) => {
      main.authorize({
        userRole: context.getAttribute("user")?.systemRole as string,
        authorizedRoles: roles,
      });
      next();
    },
  );
}

export async function handleRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    (req, res, next, context) => {
      const user = context.getAttribute("user") as ShopUser;
      const id =
        user?.reference ??
        req.headers["x-forwarded-for"]?.toString().split(",")[0] ??
        "anonymous";
      const result = main.rateLimit({ 
        id: id,
        role: user.systemRole!
      });

      res.set('X-RateLimit-Limit', result.maxRequests.toString());
      res.set('X-RateLimit-Remaining', result.remaining.toString());

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too many requests'
        });
      }

      next();
    }
  )
}

export async function unhandeledRoutes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    (req, res, next, context) => {
      res.status(404).json({ error: `Route '${req.originalUrl}' not found.` });
      next();
    },
  );
}
