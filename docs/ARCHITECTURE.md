# Architecture

## Overview

Media Grabber follows **Clean Architecture** principles with clear separation of concerns across four layers.

---

## Layers

### Domain Layer
Core business logic with zero external dependencies.

| Component | Description |
|-----------|-------------|
| `entities/` | VideoInfo, error types |
| `value-objects/` | VideoUrl, Platform, VideoFormat |
| `interfaces/` | IVideoDownloader, ICacheService, IStorageService, ILogger |

### Application Layer
Use cases that orchestrate domain logic.

| Use Case | Description |
|----------|-------------|
| `GetVideoInfo` | Fetches video metadata with cache-first strategy |
| `DownloadVideo` | Downloads video, uploads to storage, returns signed URL |

### Infrastructure Layer
External service implementations.

| Service | Implementation |
|---------|---------------|
| Video Download | yt-dlp via `youtube-dl-exec` |
| Cache | Firestore with TTL-based expiration |
| Storage | Firebase Storage with signed URLs |
| Logging | Pino with structured JSON output |

### Presentation Layer
HTTP API via Firebase Cloud Functions v2.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/getVideoInfo` | POST | Fetch video metadata |
| `/downloadVideo` | POST | Download video and return signed URL |
| `/healthCheck` | GET | Service health status |

---

## Data Flow

```
Client -> Cloud Function -> Middleware (CORS, Rate Limit, Validation)
       -> Use Case -> Domain (VideoUrl validation)
       -> Infrastructure (yt-dlp / Cache / Storage)
       -> Response
```

---

## Security

| Measure | Implementation |
|---------|---------------|
| Rate Limiting | Firestore-based, 10 req/min per IP |
| Input Validation | Zod schemas with URL pattern matching |
| CORS | Whitelist-based origin control |
| Firestore Rules | Deny all client access |
| Storage Rules | Server-only write, signed URL reads |
| Log Redaction | Automatic redaction of sensitive fields |

---

## Caching Strategy

| Data | TTL | Storage |
|------|-----|---------|
| Video metadata | 1 hour | Firestore |
| Download URLs | 30 minutes | Firestore |
| Video files | 30 minutes | Firebase Storage |
