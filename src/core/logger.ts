import winston from "winston";
import { getCurrentContext } from "@/src/core/context";

type LogFormat = "JSON" | "SIMPLE" | "CLI";

type Method = "GET" | "POST" | "PUT" | "DELETE"

type LoggerOptions = {
  inputs?: any;
  replace?: boolean;
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

class BaseLogger extends winston.Logger {

  constructor(options: winston.LoggerOptions) {
    super(options)
  }

  request(method: Method, url: string, headers: Record<string, string>, body: any) {
    this.info(`HTTP REQUEST`);
  }

  response(status: number, headers: Record<string, string>, body: any) {
    this.info(`HTTP RESPONSE`);
  }
}

class Logger {
  private baseLogger: winston.Logger;

  constructor() {
    this.baseLogger = this.create();
  }

  private create() {
    const level = process.env.LOG_LEVEL ?? "info";
    const envFormat = (process.env.LOG_FORMAT ?? "CLI") as LogFormat;
    const format = loggerFormats[envFormat] ?? loggerFormats.JSON;

    const baseLogger = new BaseLogger({
      level,
      format,
      transports: [new winston.transports.Console()],
    })

    return baseLogger;
  }

  get(options?: LoggerOptions) {
    let localeLogger = this.baseLogger;

    const contextLogger = getCurrentContext()?.getAttribute("logger");
    if (contextLogger) {
      localeLogger = contextLogger;
    };
    
    if (options?.replace === true) {
      this.baseLogger = this.create();
      localeLogger = this.baseLogger;
    }

    if (options?.inputs) {
      localeLogger = localeLogger.child(options.inputs);
    }

    return localeLogger;
  }
}

export const logger = new Logger();
