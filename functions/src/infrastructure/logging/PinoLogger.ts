import pino from "pino";
import { ILogger, LogContext } from "../../domain/interfaces/ILogger";

const pinoInstance = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ["*.password", "*.token", "*.secret", "*.authorization"],
    censor: "[REDACTED]",
  },
});

export class PinoLogger implements ILogger {
  private readonly context: Record<string, unknown>;

  constructor(context: Record<string, unknown> = {}) {
    this.context = context;
  }

  info(message: string, ctx?: LogContext): void {
    pinoInstance.info({ ...this.context, ...ctx }, message);
  }

  warn(message: string, ctx?: LogContext): void {
    pinoInstance.warn({ ...this.context, ...ctx }, message);
  }

  error(message: string, error?: Error, ctx?: LogContext): void {
    pinoInstance.error(
      {
        ...this.context,
        ...ctx,
        err: error
          ? { message: error.message, stack: error.stack, name: error.name }
          : undefined,
      },
      message,
    );
  }

  debug(message: string, ctx?: LogContext): void {
    pinoInstance.debug({ ...this.context, ...ctx }, message);
  }

  child(context: Record<string, unknown>): PinoLogger {
    return new PinoLogger({ ...this.context, ...context });
  }
}
