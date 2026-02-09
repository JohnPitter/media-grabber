import { Platform } from "../value-objects/Platform";
import { VideoFormat } from "../value-objects/VideoFormat";

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  platform: Platform;
  uploader: string;
  formats: VideoFormat[];
  originalUrl: string;
  fetchedAt: number;
}
