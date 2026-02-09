import { AppError } from "../../domain/entities/errors";
import { ILogger } from "../../domain/interfaces/ILogger";
import { ZodError } from "zod";

interface HttpResponse {
  status(code: number): { json(body: unknown): void };
}

export function handleError(
  error: unknown,
  res: HttpResponse,
  logger: ILogger,
  requestId: string,
): void {
  if (error instanceof AppError) {
    logger.warn("Application error", {
      requestId,
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
    });

    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
      requestId,
    });
    return;
  }

  if (error instanceof ZodError) {
    const messages = error.errors.map((e) => e.message);
    logger.warn("Validation error", { requestId, messages });

    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: messages.join("; "),
      },
      requestId,
    });
    return;
  }

  logger.error(
    "Unexpected error",
    error instanceof Error ? error : new Error(String(error)),
    { requestId },
  );

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
    requestId,
  });
}
