import { NextFunction, RequestHandler, Request, Response } from "express";
import { authorization, validateAccessToken } from "./authorization";
import { handleAPIError } from "../api/error-classes";
import { Context, generateSpanId, generateTraceId, runWithContext } from "../api/context";
import { logger } from "../utils/logger";
import path from "path";

const LOGGER = logger.get({
  source: "middleware",
  module: path.basename(__filename),
});

export const TRACE_HEADER = 'x-trace-id';
export const SPAN_HEADER = 'x-span-id';
export const PARENT_SPAN_HEADER = 'x-parent-span-id';

export async function handleValidateAccessToken(
  req: Request,
  res: Response,
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

export function handleCreationOfRequestContext(req: Request, res: Response, next: NextFunction) {
  try {
    const traceId = (req.headers[TRACE_HEADER] as string) || generateTraceId();
    const parentSpanId = (req.headers[SPAN_HEADER] as string) || generateSpanId();
    const spanId = generateSpanId();

    const context = new Context(traceId, spanId, parentSpanId);

    // Add useful request attributes
    context.setAttribute('http.method', req.method);
    context.setAttribute('http.url', req.url);
    context.setAttribute('http.user_agent', req.headers['user-agent']);

    // Add trace ID to response headers for debugging
    res.setHeader(TRACE_HEADER, traceId);
    res.setHeader(SPAN_HEADER, spanId);

    runWithContext(context, () => {
        // Log request start
        LOGGER.info({
            traceId,
            spanId,
            message: 'Request started',
            method: req.method,
            url: req.url
        });

        // Capture response finish for logging
        res.on('finish', () => {
            const duration = Date.now() - context.startTime;
            LOGGER.info({
                traceId,
                spanId,
                message: 'Request completed',
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                durationMs: duration
            });
        });

        next();
    });
  } catch (error) {
    handleAPIError(res, error);
  }
}

export function unhandeledRoutes(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({ error: `Route '${req.originalUrl}' not found.` });
  next();
}

