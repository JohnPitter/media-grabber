import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetVideoInfo } from "../../src/application/use-cases/GetVideoInfo";
import { IVideoDownloader } from "../../src/domain/interfaces/IVideoDownloader";
import { ICacheService } from "../../src/domain/interfaces/ICacheService";
import { ILogger } from "../../src/domain/interfaces/ILogger";
import { Platform } from "../../src/domain/value-objects/Platform";
import { VideoInfo } from "../../src/domain/entities/VideoInfo";

const mockLogger: ILogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

const mockVideoInfo: VideoInfo = {
  id: "abc123",
  title: "Test Video",
  description: "A test video",
  thumbnail: "https://example.com/thumb.jpg",
  duration: 120,
  platform: Platform.YOUTUBE,
  uploader: "TestUser",
  formats: [
    {
      formatId: "22",
      extension: "mp4",
      quality: "720p",
      resolution: "1280x720",
      fileSize: 50000000,
      hasAudio: true,
      hasVideo: true,
    },
  ],
  originalUrl: "https://www.youtube.com/watch?v=abc123",
  fetchedAt: Date.now(),
};

describe("GetVideoInfo", () => {
  let mockDownloader: IVideoDownloader;
  let mockCache: ICacheService;
  let useCase: GetVideoInfo;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDownloader = {
      getVideoInfo: vi.fn().mockResolvedValue(mockVideoInfo),
      downloadVideo: vi.fn(),
    };

    mockCache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new GetVideoInfo(mockDownloader, mockCache, mockLogger);
  });

  it("fetches video info and caches it", async () => {
    const result = await useCase.execute(
      { url: "https://www.youtube.com/watch?v=abc123" },
      "req-1",
    );

    expect(result.id).toBe("abc123");
    expect(result.title).toBe("Test Video");
    expect(result.formats).toHaveLength(1);
    expect(mockDownloader.getVideoInfo).toHaveBeenCalledWith(
      "https://www.youtube.com/watch?v=abc123",
    );
    expect(mockCache.set).toHaveBeenCalled();
  });

  it("returns cached result when available", async () => {
    const cachedResult = {
      id: "abc123",
      title: "Cached Video",
      description: "",
      thumbnail: "",
      duration: 120,
      platform: "youtube",
      uploader: "TestUser",
      formats: [],
    };

    (mockCache.get as ReturnType<typeof vi.fn>).mockResolvedValue(cachedResult);

    const result = await useCase.execute(
      { url: "https://www.youtube.com/watch?v=abc123" },
      "req-2",
    );

    expect(result.title).toBe("Cached Video");
    expect(mockDownloader.getVideoInfo).not.toHaveBeenCalled();
  });

  it("throws for unsupported platform", async () => {
    await expect(
      useCase.execute({ url: "https://www.tiktok.com/video/123" }, "req-3"),
    ).rejects.toThrow();
  });
});
