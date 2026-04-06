import { NextFunction, RequestHandler } from "express";
import { authorization, validateAccessToken } from "./authorization";
import { handleAPIError } from "../api/error-classes";
import { ServerRequest, ServerResponse } from "../api/server";

export async function handleValidateAccessToken(
  req: ServerRequest,
  res: ServerResponse,
  next: NextFunction
) {
  try {
    const result = validateAccessToken({
      accessToken: req.header("Authorization") as string,
      jwtSecret: process.env.JWT_SECRET as string
    });

    req.user = result.user;

    next(); 
  } catch (error) {
    handleAPIError(res, error);
  }
}

export const handleAuthorization = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    try {
      authorization({
        userRole: (req as any)?.user?.systemRole as string,
        authorizedRoles: roles
      });

      next(); 
    } catch (error) {
      handleAPIError(res as any, error);
    }
  };
};

export function unhandeledRoutes(req: ServerRequest, res: ServerResponse, next: NextFunction) {
  res.status(404).json({ error: `Route '${req.originalUrl}' not found.` });
  next();
}

