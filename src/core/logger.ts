import winston from "winston";
import { getCurrentContext } from "@/src/core/context";

type LogFormat = "JSON" | "SIMPLE" | "CLI";

type Method = "GET" | "POST" | "PUT" | "DELETE"

type LoggerOptions = {
  inputs?: any;
  replace?: boolean;
}

type LoggerRequestOptions = {
  method: Method;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}

type LoggerResponseOptions = {
  status: number;
  headers?: Record<string, string>;
  body?: any
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
  ),
  SIMPLE: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
  CLI: winston.format.combine(winston.format.colorize(), winston.format.cli()),
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
      request: (options: LoggerRequestOptions) => localLogger.info("HTTP REQUEST", { ...options }),
      response: (options: LoggerResponseOptions) => localLogger.info("HTTP RESPONSE", { ...options }),
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
