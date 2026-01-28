import winston from "winston";

type LogFormat = "JSON" | "SIMPLE" | "CLI";

const loggerFormats: Record<LogFormat, winston.Logform.Format> = {
  JSON: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  SIMPLE: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  CLI: winston.format.combine(winston.format.colorize(), winston.format.cli()),
};

interface LoggerContext {
  source?: string;
  service?: string;
  module?: string;
}

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

  get(context: LoggerContext, replace: boolean = false) {
    if (replace) {
      this.baseLogger = this.create();
    }

    return this.baseLogger.child(context);
  }

}

export const logger = new Logger();
