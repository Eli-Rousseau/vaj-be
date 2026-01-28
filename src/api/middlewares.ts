import { NextFunction, Request, Response } from "express";

const RATE_WINDOW_MS = 60_000;
const RATE_THRESHOLD = 1000;

let requestCounter = 0;
let windowStart = Date.now();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();

  if (now >= windowStart + RATE_WINDOW_MS) {
    windowStart = now;
    requestCounter = 0;
  }

  requestCounter++;

  if (requestCounter > RATE_THRESHOLD) {
    const retryAfterSeconds = Math.ceil((windowStart + RATE_WINDOW_MS - now) / 1000);
    res.setHeader("Retry-After", retryAfterSeconds.toString());
    res.status(429).json({
      message: "Rate limit exceeded. Please try again later.",
    });
    return;
  }

  next();
}

export function unhandeledRoutes(req: Request, res: Response, next: NextFunction) {
  res.status(404)
  .json({ error: `Route '${req.originalUrl}' not found.` })
  .end();
  return;
}
