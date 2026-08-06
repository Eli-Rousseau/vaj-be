import path from "path";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

import { logger } from "@/src/utils/logger";
import { ShopUser } from "@/src/database/classes/transformer-classes";
import { Context, getCurrentContext } from "@/src/middleware/context";
import * as errors from "@/src/utils/errors";
import { generateJWTToken } from "@/src/utils/jwt";

type WrapperOptions = {
  handlerName: string;
  service: string;
  setupContext?: boolean;
  initializeAccessToken?: boolean;
};

type WrappedHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  context: Context,
) => unknown | Promise<unknown>;

const LOGGER = logger.get({
  source: "api",
  module: path.basename(__filename),
});

export const withHandler = async function (
  req: Request,
  res: Response,
  next: NextFunction,
  options: WrapperOptions,
  handler: WrappedHandler,
) {
  let context;
  if (options.setupContext) {
    const traceId =
      (req.headers["x-trace-id"] as string) || crypto.randomUUID();
    context = new Context(traceId);
    res.setHeader("x-trace-id", traceId);
  } else {
    context = getCurrentContext();
  }

  if (options.initializeAccessToken) initializeAccessToken(context);

  const shopUser = context?.getAttribute("user") as ShopUser | undefined;
  const user = shopUser?.toPlain({ onlyMutables: true }) ?? null;

  const requestLogger = LOGGER.child({
    traceId: context.traceId,
    handler: options.handlerName,
    method: req.method,
    route: req.originalUrl,
    user,
    service: options.service,
  });

  const startedAt = Date.now();

  try {
    requestLogger.info(
      `${context.traceId} - START - ${options.service} - ${options.handlerName}`,
      {
        params: req.params,
        query: req.query,
        body: req.body,
      },
    );

    await handler(req, res, next, context);

    requestLogger.info(
      `${context.traceId} - END - ${options.service} - ${options.handlerName}`,
      {
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      },
    );
  } catch (error: any) {
    requestLogger.error(
      `${context.traceId} - FAILED - ${options.service} - ${options.handlerName}`,
      {
        durationMs: Date.now() - startedAt,
        error: {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
        },
      },
    );

    handleAPIError(res as any, error);
  }
};

/**
 * Useful for assigning the accessToken on the context or local storage for each request.
 * This is especially important for making requests on the graphql server for instance as
 * it can pass down the access token for downstream authorization.
 */
export async function initializeAccessToken(context: Context) {
  let accessToken = context.getAttribute("accessToken");
  if (!accessToken) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new errors.ConfigError("CONFIG_MISSING_JWT_SECRET");

    const userEmail = process.env.DEFAULT_USER_EMAIL;
    if (!userEmail)
      throw new errors.ConfigError("CONFIG_MISSING_DEFAULT_USER_EMAIL");

    const user = ShopUser.fromPlain({
      reference: crypto.randomBytes(16).toString("hex"),
      sequentialId: 0,
      email: userEmail,
      systemRole: "ADMINISTRATOR",
      systemAuthentication: "INTERNAL",
    });

    accessToken = generateJWTToken(user, jwtSecret, 600);
    context.setAttribute("accessToken", accessToken);
  }
}

type ErrorConfig = {
  classes: Array<new (...args: any[]) => Error>;
  statusCode: number;
  message: string;
};

const DEFAULT_ERROR_CONFIG: ErrorConfig[] = [
  {
    classes: [errors.AuthenticationError],
    statusCode: 401,
    message: "Failed authentication",
  },
  {
    classes: [errors.AuthorizationError],
    statusCode: 401,
    message: "Failed authorization",
  },
  {
    classes: [errors.BadRequestError],
    statusCode: 400,
    message: "Invalid request",
  },
  {
    classes: [errors.ConfigError],
    statusCode: 500,
    message: "Incorrect configuration",
  },
  {
    classes: [errors.DatabaseError],
    statusCode: 500,
    message: "Database error",
  },
  {
    classes: [errors.DataInconsistencyError],
    statusCode: 500,
    message: "Data inconsistency detected",
  },
  {
    classes: [errors.CustomTypeError],
    statusCode: 400,
    message: "Incorrect data type",
  },
];

type HandleAPIErrorOptions = {
  otherErrorClasses?: ErrorConfig[];
};

export function handleAPIError(
  res: Response,
  error: unknown,
  options?: HandleAPIErrorOptions,
) {
  const configs = [
    ...(options?.otherErrorClasses || []),
    ...DEFAULT_ERROR_CONFIG,
  ];

  LOGGER.error((error as any).message);

  for (const config of configs) {
    if (config.classes.some((cls) => error instanceof cls)) {
      return res.status(config.statusCode).json({
        error: config.message,
        errorMessage: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      });
    }
  }

  return res.status(500).json({
    error: "Unknown error",
    errorMessage: error instanceof Error ? error.message : "UNKNOWN_ERROR",
  });
}
