import { VideoUrl } from "../../domain/value-objects";
import { IVideoDownloader } from "../../domain/interfaces/IVideoDownloader";
import { ICacheService } from "../../domain/interfaces/ICacheService";
import { ILogger } from "../../domain/interfaces/ILogger";
import { VideoInfoRequestDto, VideoInfoResponseDto } from "../dtos";

const CACHE_TTL_SECONDS = 3600;

export class GetVideoInfo {
  constructor(
    private readonly downloader: IVideoDownloader,
    private readonly cache: ICacheService,
    private readonly logger: ILogger,
  ) {}

  async execute(
    dto: VideoInfoRequestDto,
    requestId: string,
  ): Promise<VideoInfoResponseDto> {
    const videoUrl = VideoUrl.create(dto.url);
    const cacheKey = `video-info:${videoUrl.url}`;

    this.logger.info("Fetching video info", {
      requestId,
      url: videoUrl.url,
      platform: videoUrl.platform,
    });

    const cached = await this.cache.get<VideoInfoResponseDto>(cacheKey);
    if (cached) {
      this.logger.info("Cache hit for video info", { requestId, cacheKey });
      return cached;
    }

    this.logger.info("Cache miss, fetching from provider", { requestId });

    const videoInfo = await this.downloader.getVideoInfo(videoUrl.url);

    const response: VideoInfoResponseDto = {
      id: videoInfo.id,
      title: videoInfo.title,
      description: videoInfo.description,
      thumbnail: videoInfo.thumbnail,
      duration: videoInfo.duration,
      platform: videoInfo.platform,
      uploader: videoInfo.uploader,
      formats: videoInfo.formats.map((f) => ({
        formatId: f.formatId,
        extension: f.extension,
        quality: f.quality,
        resolution: f.resolution,
        fileSize: f.fileSize,
        hasAudio: f.hasAudio,
        hasVideo: f.hasVideo,
      })),
    };

    await this.cache.set(cacheKey, response, CACHE_TTL_SECONDS);

    this.logger.info("Video info fetched and cached", {
      requestId,
      videoId: response.id,
      formatsCount: response.formats.length,
    });

    return response;
  }
}
