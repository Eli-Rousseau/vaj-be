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

let baseLogger: winston.Logger | null = null;

/**
 * Creates and caches a Winston base logger.
 */
function createBaseLogger(replace: boolean = false): winston.Logger {
  if (baseLogger && !replace) return baseLogger;

  const level = process.env.LOG_LEVEL ?? "info";
  const envFormat = (process.env.LOG_FORMAT ?? "CLI") as LogFormat;
  const format = loggerFormats[envFormat] ?? loggerFormats.JSON;

  baseLogger = winston.createLogger({
    level,
    format,
    transports: [new winston.transports.Console()],
  });

  return baseLogger;
}

interface LoggerContext {
  source?: string;
  service?: string;
  module?: string;
}

/**
 * @description Returns a configured Winston child logger.
 * Automatically lazy-initializes the base logger.
 */
function getLogger(
  context: LoggerContext = {},
  replaceLogger: boolean = false
): winston.Logger {
  const logger = createBaseLogger(replaceLogger);
  return logger.child(context);
}

export default getLogger;
