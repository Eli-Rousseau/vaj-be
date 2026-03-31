import { Response } from "express";

export class AuthenticationError extends Error {}
export class BadRequestError extends Error {}
export class ConfigError extends Error {}
export class DatabaseError extends Error {}
export class DataInconsistencyError extends Error {}
export class CustomTypeError extends Error {}

type ErrorConfig = {
  classes: Array<new (...args: any[]) => Error>;
  statusCode: number;
  message: string;
};

const DEFAULT_ERROR_CONFIG: ErrorConfig[] = [
  {
    classes: [AuthenticationError],
    statusCode: 401,
    message: "Failed authentication",
  },
  {
    classes: [BadRequestError],
    statusCode: 400,
    message: "Invalid request",
  },
  {
    classes: [ConfigError],
    statusCode: 500,
    message: "Incorrect configuration",
  },
  {
    classes: [DatabaseError],
    statusCode: 500,
    message: "Database error",
  },
  {
    classes: [DataInconsistencyError],
    statusCode: 500,
    message: "Data inconsistency detected",
  },
  {
    classes: [CustomTypeError],
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