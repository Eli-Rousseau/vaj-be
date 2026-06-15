import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

import { registerUser } from "@/src/authentication/register";
import { loginUser } from "@/src/authentication/login";
import { refreshToken } from "@/src/authentication/refresh";
import { withHandler } from "@/src/api/wrapper";
import { ConfigError } from "@/src/utils/errors";
import { ShopUser } from "@/src/database/classes/transformer-classes";
import { generateJWTToken } from "@/src/utils/jwt";
import { Context } from "@/src/middleware/context";

export async function handleInternalRegister(req: Request, res: Response, next: NextFunction) {
  await withHandler(
    req, res, next,
    {
      handlerName: "handleInternalRegister",
      service: "authentication"
    },
    async (req, res, next, context) => {
      setAccessTokenOnContext(context);

      const result = await registerUser({
        user: req.body?.user,
        jwtSecret: process.env.JWT_SECRET as string
      });

      res.status(201).json({ 
        "accessToken": result.accessToken,
        "refreshToken": `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`
      });
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
      setAccessTokenOnContext(context);

      const result = await loginUser({
        user: req.body?.user,
        jwtSecret: process.env.JWT_SECRET as string
      });

      res.status(201).json({ 
        "accessToken": result.accessToken,
        "refreshToken": `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`
      });
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
      setAccessTokenOnContext(context);

      const result = await refreshToken({
        tokenReferenceAndHash: req.body?.refreshToken,
        jwtSecret: process.env.JWT_SECRET as string
      });

      res.status(201).json({
        "accessToken": result.accessToken,
        "refreshToken": `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`
      })
    }
  )
}

/**
 * Useful for assigning the accessToken on the context or local storage for each request.
 * This is especially important for making requests on the graphql server for instance as 
 * it can pass down the access token for downstream authorization.
 */
export async function setAccessTokenOnContext(context: Context) {
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