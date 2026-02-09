export const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  WINDOW_SECONDS: 60,
} as const;

export const CACHE_TTL = {
  VIDEO_INFO_SECONDS: 3600,
  DOWNLOAD_URL_SECONDS: 1800,
} as const;

export const DOWNLOAD = {
  URL_EXPIRY_MINUTES: 30,
  MAX_DURATION_SECONDS: 1800,
} as const;

export const CORS_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5000",
] as const;
