import winston from "winston";
import { getCurrentContext } from "@/src/core/context";

type LogFormat = "JSON" | "SIMPLE" | "CLI";

type LoggerOptions = {
  inputs?: any;
  replace?: boolean;
}

type LoggerRequestOptions = {
  url: string;
  request: Request | { method: string; headers: any; body: any };
  keepBody?: boolean;
}

type LoggerResponseOptions = {
  response: Response;
  keepBody?: boolean;
}

interface BaseLogger extends winston.Logger{
  request(options: LoggerRequestOptions): any;
  response(options: LoggerResponseOptions): any;
}

const loggerFormats: Record<LogFormat, winston.Logform.Format> = {
  JSON: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
  SIMPLE: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
  CLI: winston.format.combine(
    winston.format.colorize(), 
    winston.format.cli()
  ),
};

const formatHeaders = (
  headers: unknown,
  fieldsToMask: string[] = []
): Record<string, string> => {
  if (!headers) return {};

  const maskedFields = new Set(
    fieldsToMask.map(field => field.toLowerCase())
  );

  let entries: [string, unknown][];

  if (headers instanceof Headers) {
    entries = Array.from(headers);
  } else if (typeof headers === "object") {
    entries = Object.entries(headers as Record<string, unknown>);
  } else {
    return {};
  }

  return Object.fromEntries(
    entries.map(([key, value]) => [
      key,
      maskedFields.has(key.toLowerCase())
        ? "***MASKED***"
        : String(value),
    ])
  );
};

class Logger {
  private baseLogger: BaseLogger;

  constructor() {
    this.baseLogger = this.create();
  }

  private create() {
    const level = process.env.LOG_LEVEL ?? "info";
    const envFormat = (process.env.LOG_FORMAT ?? "CLI") as LogFormat;
    const format = loggerFormats[envFormat] ?? loggerFormats.JSON;

    const localLogger = winston.createLogger({
      level,
      format,
      transports: [new winston.transports.Console()],
    });

    return Object.assign(localLogger, {
      request: (options: LoggerRequestOptions) => {
        const log = [
          "HTTP REQUEST",
          `METHOD: ${options.request.method}`,
          `URL: ${options.url}`,
          `HEADERS: ${JSON.stringify(formatHeaders(options.request?.headers, ["Authorization"]))}`,
          `BODY: ${options.keepBody && options.request.body ? JSON.stringify(options.request.body) : ""}`
        ]
        localLogger.info(log.join("\n"));
      },
      response: (options: LoggerResponseOptions) => {
        const log = [
          "HTTP RESPONSE",
          `STATUS: ${options.response.status.toString()}`,
          `HEADERS: ${JSON.stringify(formatHeaders(options.response.headers, ["Authorization"]))}`,
          `BODY: ${options.keepBody && options.response.body ? JSON.stringify(options.response.body) : ""}`
        ]

        if (options.response.ok) localLogger.info(log.join("\n"));
        else localLogger.warn(log.join("\n"));
      },
    }) as unknown as BaseLogger;
  }

  get(options?: LoggerOptions) {
    let localLogger = this.baseLogger;

    const contextLogger = getCurrentContext()?.getAttribute("logger");
    if (contextLogger) {
      localLogger = contextLogger;
    };
    
    if (options?.replace === true) {
      this.baseLogger = this.create();
      localLogger = this.baseLogger;
    }

    if (options?.inputs) {
      localLogger = localLogger.child(options.inputs);
    }

    return localLogger;
  }
}

export const logger = new Logger();
