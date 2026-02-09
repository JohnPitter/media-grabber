export interface IStorageService {
  upload(
    filePath: string,
    destination: string,
    mimeType: string,
  ): Promise<string>;
  getSignedUrl(destination: string, expiresInMinutes: number): Promise<string>;
  delete(destination: string): Promise<void>;
}
