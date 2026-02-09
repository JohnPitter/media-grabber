import { detectPlatform, Platform } from "./Platform";
import { UnsupportedPlatformError } from "../entities/errors";

export class VideoUrl {
  readonly url: string;
  readonly platform: Platform;

  private constructor(url: string, platform: Platform) {
    this.url = url;
    this.platform = platform;
  }

  static create(rawUrl: string): VideoUrl {
    const sanitized = rawUrl.trim();

    try {
      new URL(sanitized);
    } catch {
      throw new UnsupportedPlatformError(`Invalid URL: ${sanitized}`);
    }

    const platform = detectPlatform(sanitized);
    if (!platform) {
      throw new UnsupportedPlatformError(
        `Unsupported platform for URL: ${sanitized}`,
      );
    }

    return new VideoUrl(sanitized, platform);
  }

  toString(): string {
    return this.url;
  }
}
