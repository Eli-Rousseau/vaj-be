import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { authorization, validateAccessToken } from "@/src/middleware/authorization";
import { runWithContext } from "@/src/middleware/context";
import { withHandler } from "@/src/api/wrapper";
import { generateJWTToken } from "@/src/utils/jwt";
import { ConfigError } from "@/src/utils/errors";
import { ShopUser } from "@/src/database/classes/transformer-classes";

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
      const accessToken = req.header("Authorization") as string;

      const result = validateAccessToken({
        accessToken: accessToken,
        jwtSecret: process.env.JWT_SECRET as string
      });

      context.setAttribute("accessToken", accessToken);
      context.setAttribute("user", result.user);
      next();
    }
  )
}

/**
 * Pass an array as input to determine what role a user must be assigned to 
 * authorize the request.
 */
export async function handleAuthorization(req: Request, res: Response, next: NextFunction, roles: string[]) {
  await withHandler(
    req, res, next,
    {
      handlerName: "handleAuthorization",
      service: "middleware"
    },
    (req, res, next, context) => {
      authorization({
        userRole: context.getAttribute("user")?.systemRole as string,
        authorizedRoles: roles
      });
      next();
    }
  )
};

/**
 * Useful for assigning the accessToken on the context or local storage for each request.
 * This is especially important for making requests on the graphql server for instance as 
 * it can pass down the access token for downstream authorization.
 */
export async function setAccessTokenOnContext(req: Request, res: Response, next: NextFunction) {
  await withHandler(
    req, res, next,
    {
      handlerName: "setAccessTokenOnContext",
      service: "middleware"
    },
    (req, res, next, context) => {
      let accessToken = context.getAttribute("accessToken");
      if (!accessToken) {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) throw new ConfigError("CONFIG_MISSING_JWT_SECRET");

        const userEmail = process.env.DEFAULT_USER_EMAIL;
        if (!userEmail) throw new ConfigError("CONFIG_MISSING_DEFAULT_USER_EMAIL");

        const user = ShopUser.fromPlain({
          reference: crypto.randomBytes(16).toString("hex"),
          sequentialId: 0,
          email: userEmail,
          systemRole: "ADMINISTRATOR",
          systemAuthentication: "INTERNAL"

        });
        
        accessToken = generateJWTToken(user, jwtSecret, 600);
        context.setAttribute("accessToken", accessToken);
      }
    }
  )
}

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

