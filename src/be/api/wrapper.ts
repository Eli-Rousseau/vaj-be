import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

import { logger } from "@/src/core/logger";
import { ShopUser } from "@/src/be/database/classes/transformer-classes";
import { Context, getCurrentContext } from "@/src/core/context";
import * as errors from "@/src/core/errors";

type WrapperOptions = {
  setupContext?: boolean;
};

type WrappedHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  context: Context,
) => unknown | Promise<unknown>;

const LOGGER = logger.get();

function getHandlerAndServiceName() {
  const stack = new Error().stack as string;
  const line = stack.split("\n")[3];
  const parts = line.split(/\s+/);
  return {
    handlerName: parts[2],
    serviceName: parts[3].split("/").reverse()[1]
  }
}

export const withHandler = async function (
  req: Request,
  res: Response,
  next: NextFunction,
  handler: WrappedHandler,
  options: WrapperOptions = {}
) {
  let context;
  if (options.setupContext) {
    const traceId =
      (req.headers["x-trace-id"] as string) || crypto.randomUUID();
    context = new Context(traceId);
    context.setAttribute("logger", logger.get({ replace: true }));
    res.setHeader("x-trace-id", traceId);
  } else {
    context = getCurrentContext();
  }

  const shopUser = context?.getAttribute("user") as ShopUser | undefined;
  const user = shopUser?.toPlain({ onlyMutables: true }) ?? null;

  const { handlerName, serviceName } = getHandlerAndServiceName();

  const newLogger = logger.get({
    replace: true,
    inputs: {
      traceId: context.traceId,
      service: serviceName,
      handler: handlerName,
      method: req.method,
      route: req.originalUrl,
      user
    }
  });
  context.setAttribute("logger", newLogger);

  const startedAt = Date.now();

  try {
    newLogger.info(
      `${context.traceId} - START - ${serviceName} - ${handlerName}`,
      {
        params: req.params,
        query: req.query,
        body: req.body,
      },
    );

    await handler(req, res, next, context);

    newLogger.info(
      `${context.traceId} - END - ${serviceName} - ${handlerName}`,
      {
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      },
    );
  } catch (error: any) {
    newLogger.error(
      `${context.traceId} - FAILED - ${serviceName} - ${handlerName}`,
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
  } finally {
    context.setAttribute("logger", logger.get({ replace: true }));
  }
};


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
