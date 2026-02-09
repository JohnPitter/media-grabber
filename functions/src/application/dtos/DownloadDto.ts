export interface DownloadRequestDto {
  url: string;
  formatId: string;
}

export interface DownloadResponseDto {
  downloadUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
  expiresAt: number;
}
