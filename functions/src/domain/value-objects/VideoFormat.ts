export interface VideoFormat {
  formatId: string;
  extension: string;
  quality: string;
  resolution: string | null;
  fileSize: number | null;
  hasAudio: boolean;
  hasVideo: boolean;
}
