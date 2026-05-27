import { randomUUID } from "crypto";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { handleAPIError } from "./api-errors";
import { Context, getCurrentContext } from "../middleware/context";
import { ShopUser } from "../database/classes/transformer-classes";
import { logger } from "../utils/logger";
import path from "path";

type WrapperOptions = {
  handlerName: string;
  service: string;
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

export const withHandler = async function(
  req: Request,
  res: Response,
  next: NextFunction,
  options: WrapperOptions,
  handler: WrappedHandler
) {
  let context;
  if (options.setupContext) {
      const traceId = (req.headers["x-trace-id"] as string) || randomUUID();
      context = new Context(traceId);
      res.setHeader("x-trace-id", traceId);
  }
  else {
      context = getCurrentContext();
  }

  const shopUser = context?.getAttribute("user") as ShopUser | undefined;
  const user = shopUser?.toPlain({ onlyMutables: true }) ?? null;

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
    requestLogger.info(`${context.traceId} - START - ${options.service} - ${options.handlerName}`, {
      params: req.params,
      query: req.query,
      body: req.body
    });

    await handler(req, res, next, context);

    requestLogger.info(`${context.traceId} - END - ${options.service} - ${options.handlerName}`, {
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt
    });
  } catch (error: any) {
    requestLogger.error(`${context.traceId} - FAILED - ${options.service} - ${options.handlerName}`, {
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

  

  