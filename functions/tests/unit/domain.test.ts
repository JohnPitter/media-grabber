import { describe, it, expect } from "vitest";
import { VideoUrl } from "../../src/domain/value-objects/VideoUrl";
import { Platform, detectPlatform } from "../../src/domain/value-objects/Platform";
import {
  UnsupportedPlatformError,
  VideoNotFoundError,
  DownloadError,
  RateLimitError,
  AppError,
} from "../../src/domain/entities/errors";

describe("Platform detection", () => {
  it("detects YouTube watch URLs", () => {
    expect(detectPlatform("https://www.youtube.com/watch?v=abc123")).toBe(Platform.YOUTUBE);
    expect(detectPlatform("https://youtube.com/watch?v=abc123")).toBe(Platform.YOUTUBE);
  });

  it("detects YouTube short URLs", () => {
    expect(detectPlatform("https://youtu.be/abc123")).toBe(Platform.YOUTUBE);
  });

  it("detects YouTube shorts", () => {
    expect(detectPlatform("https://www.youtube.com/shorts/abc123")).toBe(Platform.YOUTUBE);
  });

  it("detects Instagram posts", () => {
    expect(detectPlatform("https://www.instagram.com/p/abc123")).toBe(Platform.INSTAGRAM);
  });

  it("detects Instagram reels", () => {
    expect(detectPlatform("https://www.instagram.com/reel/abc123")).toBe(Platform.INSTAGRAM);
    expect(detectPlatform("https://www.instagram.com/reels/abc123")).toBe(Platform.INSTAGRAM);
  });

  it("returns null for unsupported platforms", () => {
    expect(detectPlatform("https://www.tiktok.com/@user/video/123")).toBeNull();
    expect(detectPlatform("https://www.google.com")).toBeNull();
  });
});

describe("VideoUrl", () => {
  it("creates a valid YouTube URL", () => {
    const videoUrl = VideoUrl.create("https://www.youtube.com/watch?v=abc123");
    expect(videoUrl.url).toBe("https://www.youtube.com/watch?v=abc123");
    expect(videoUrl.platform).toBe(Platform.YOUTUBE);
  });

  it("creates a valid Instagram URL", () => {
    const videoUrl = VideoUrl.create("https://www.instagram.com/reel/abc123");
    expect(videoUrl.url).toBe("https://www.instagram.com/reel/abc123");
    expect(videoUrl.platform).toBe(Platform.INSTAGRAM);
  });

  it("trims whitespace", () => {
    const videoUrl = VideoUrl.create("  https://youtu.be/abc123  ");
    expect(videoUrl.url).toBe("https://youtu.be/abc123");
  });

  it("throws UnsupportedPlatformError for invalid URL", () => {
    expect(() => VideoUrl.create("not a url")).toThrow(UnsupportedPlatformError);
  });

  it("throws UnsupportedPlatformError for unsupported platform", () => {
    expect(() => VideoUrl.create("https://www.tiktok.com/@user/video/123")).toThrow(
      UnsupportedPlatformError,
    );
  });

  it("toString returns the URL", () => {
    const videoUrl = VideoUrl.create("https://youtu.be/abc123");
    expect(videoUrl.toString()).toBe("https://youtu.be/abc123");
  });
});

describe("Error classes", () => {
  it("AppError has correct properties", () => {
    const error = new AppError("test", 500, "TEST");
    expect(error.message).toBe("test");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("TEST");
    expect(error).toBeInstanceOf(Error);
  });

  it("VideoNotFoundError defaults", () => {
    const error = new VideoNotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("VIDEO_NOT_FOUND");
  });

  it("UnsupportedPlatformError defaults", () => {
    const error = new UnsupportedPlatformError();
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("UNSUPPORTED_PLATFORM");
  });

  it("DownloadError defaults", () => {
    const error = new DownloadError();
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("DOWNLOAD_ERROR");
  });

  it("RateLimitError defaults", () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
  });
});
