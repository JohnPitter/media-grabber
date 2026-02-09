import { VideoUrl } from "../../domain/value-objects";
import { IVideoDownloader } from "../../domain/interfaces/IVideoDownloader";
import { IStorageService } from "../../domain/interfaces/IStorageService";
import { ICacheService } from "../../domain/interfaces/ICacheService";
import { ILogger } from "../../domain/interfaces/ILogger";
import { DownloadRequestDto, DownloadResponseDto } from "../dtos";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";

const DOWNLOAD_URL_TTL_MINUTES = 30;
const DOWNLOAD_CACHE_TTL_SECONDS = 1800;

export class DownloadVideo {
  constructor(
    private readonly downloader: IVideoDownloader,
    private readonly storage: IStorageService,
    private readonly cache: ICacheService,
    private readonly logger: ILogger,
  ) {}

  async execute(
    dto: DownloadRequestDto,
    requestId: string,
  ): Promise<DownloadResponseDto> {
    const videoUrl = VideoUrl.create(dto.url);
    const cacheKey = `download:${videoUrl.url}:${dto.formatId}`;

    this.logger.info("Starting video download", {
      requestId,
      url: videoUrl.url,
      formatId: dto.formatId,
    });

    const cached = await this.cache.get<DownloadResponseDto>(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      this.logger.info("Cache hit for download URL", { requestId, cacheKey });
      return cached;
    }

    const result = await this.downloader.downloadVideo(
      videoUrl.url,
      dto.formatId,
    );

    const destination = `downloads/${uuidv4()}/${result.fileName}`;

    this.logger.info("Uploading to storage", {
      requestId,
      destination,
      size: result.size,
    });

    await this.storage.upload(result.filePath, destination, result.mimeType);

    const signedUrl = await this.storage.getSignedUrl(
      destination,
      DOWNLOAD_URL_TTL_MINUTES,
    );

    // Clean up temp file
    try {
      fs.unlinkSync(result.filePath);
    } catch {
      this.logger.warn("Failed to clean up temp file", {
        requestId,
        filePath: result.filePath,
      });
    }

    const expiresAt =
      Date.now() + DOWNLOAD_URL_TTL_MINUTES * 60 * 1000;

    const response: DownloadResponseDto = {
      downloadUrl: signedUrl,
      fileName: result.fileName,
      mimeType: result.mimeType,
      size: result.size,
      expiresAt,
    };

    await this.cache.set(cacheKey, response, DOWNLOAD_CACHE_TTL_SECONDS);

    this.logger.info("Download ready", {
      requestId,
      fileName: result.fileName,
      size: result.size,
    });

    // Schedule cleanup of storage file
    setTimeout(async () => {
      try {
        await this.storage.delete(destination);
        this.logger.info("Cleaned up storage file", { destination });
      } catch {
        this.logger.warn("Failed to clean up storage file", { destination });
      }
    }, DOWNLOAD_URL_TTL_MINUTES * 60 * 1000);

    return response;
  }
}
