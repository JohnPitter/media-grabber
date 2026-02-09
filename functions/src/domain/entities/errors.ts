export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class VideoNotFoundError extends AppError {
  constructor(message = "Video not found or unavailable") {
    super(message, 404, "VIDEO_NOT_FOUND");
  }
}

export class UnsupportedPlatformError extends AppError {
  constructor(message = "Unsupported platform") {
    super(message, 400, "UNSUPPORTED_PLATFORM");
  }
}

export class DownloadError extends AppError {
  constructor(message = "Failed to download video") {
    super(message, 500, "DOWNLOAD_ERROR");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}
