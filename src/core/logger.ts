import winston from "winston";
import { getCurrentContext } from "@/src/be/api/middleware/context";

type LogFormat = "JSON" | "SIMPLE" | "CLI";

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
  private baseLogger: winston.Logger;

  constructor() {
    this.baseLogger = this.create();
  }

  private create(replace: boolean = false) {
    const level = process.env.LOG_LEVEL ?? "info";
    const envFormat = (process.env.LOG_FORMAT ?? "CLI") as LogFormat;
    const format = loggerFormats[envFormat] ?? loggerFormats.JSON;

    const baseLogger = winston.createLogger({
      level,
      format,
      transports: [new winston.transports.Console()],
    });

    return baseLogger;
  }

  get(context?: object, replace: boolean = false) {
    const contextLogger = getCurrentContext()?.getAttribute("logger");
    if (contextLogger) return contextLogger;
    
    if (replace) {
      this.baseLogger = this.create();
    }

    return context ? this.baseLogger.child(context) : this.baseLogger;
  }
}

export const logger = new Logger();
