import { randomUUID } from "crypto";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { handleAPIError } from "./api-errors";
import { Context, getCurrentContext } from "../middleware/context";
import { ShopUser } from "../database/classes/transformer-classes";
import { logger } from "../utils/logger";
import path from "path";

interface WrapperOptions {
  handlerName: string;
  service?: string;
  logBody?: boolean;
  setupContext?: boolean;
}

type WrappedHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  context: Context
) => unknown | Promise<unknown>;

const LOGGER = logger.get({
    source: "api",
    module: path.basename(__filename)
});

export const withHandler =
  (
    options: WrapperOptions,
    handler: WrappedHandler
  ): RequestHandler =>
  async (req, res, next) => {
    let context;
    if (options.setupContext) {
        const traceId = (req.headers["x-trace-id"] as string) || randomUUID();
        context = new Context(traceId);
        res.setHeader("x-trace-id", traceId);
    }
    else {
        context = getCurrentContext();
    }

    const user = (context.getAttribute("user") as ShopUser)?.toPlain({ onlyMutables: true}) || null;

    const requestLogger = LOGGER.child({
      traceId: context.traceId,
      handler: options.handlerName,
      method: req.method,
      route: req.originalUrl,
      user,
      service: options.service
    });

    const startedAt = Date.now();

    try {
      requestLogger.info("HANDLER_STARTED", {
        params: req.params,
        query: req.query,
        body: options.logBody ? req.body : null
      });

      // attach logger to request
      (req as any).logger = requestLogger;

      await handler(req, res, next, context);

      requestLogger.info("HANDLER_COMPLETED", {
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt
      });
    } catch (error: any) {
      requestLogger.error("HANDLER_FAILED", {
        durationMs: Date.now() - startedAt,
        error: {
          name: error?.name,
          message: error?.message,
          stack: error?.stack
        }
      });

      handleAPIError(res as any, error);
    }
  };