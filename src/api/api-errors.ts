import { Response } from "express";
import { logger } from "../utils/logger";
import path from "path";
import * as errors from "../utils/errors";

type ErrorConfig = {
  classes: Array<new (...args: any[]) => Error>;
  statusCode: number;
  message: string;
};

const LOGGER = logger.get({
  source: "api",
  module: path.basename(__filename)
});

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
  options?: HandleAPIErrorOptions
) {
  const configs = [...(options?.otherErrorClasses || []), ...DEFAULT_ERROR_CONFIG];

  LOGGER.error((error as any).message);

  for (const config of configs) {
    if (config.classes.some(cls => error instanceof cls)) {
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