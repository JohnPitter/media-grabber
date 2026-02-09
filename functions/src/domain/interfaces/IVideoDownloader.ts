import { VideoInfo } from "../entities/VideoInfo";

export interface DownloadResult {
  filePath: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface IVideoDownloader {
  getVideoInfo(url: string): Promise<VideoInfo>;
  downloadVideo(url: string, formatId: string): Promise<DownloadResult>;
}
