export interface VideoInfoRequestDto {
  url: string;
}

export interface VideoFormatDto {
  formatId: string;
  extension: string;
  quality: string;
  resolution: string | null;
  fileSize: number | null;
  hasAudio: boolean;
  hasVideo: boolean;
}

export interface VideoInfoResponseDto {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  platform: string;
  uploader: string;
  formats: VideoFormatDto[];
}
