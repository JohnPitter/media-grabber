import * as admin from "firebase-admin";
import { IStorageService } from "../../domain/interfaces/IStorageService";
import { ILogger } from "../../domain/interfaces/ILogger";

export class FirebaseStorageService implements IStorageService {
  private readonly bucket: ReturnType<typeof admin.storage.prototype.bucket>;

  constructor(private readonly logger: ILogger) {
    this.bucket = admin.storage().bucket();
  }

  async upload(
    filePath: string,
    destination: string,
    mimeType: string,
  ): Promise<string> {
    this.logger.info("Uploading file to storage", { destination, mimeType });

    await this.bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: mimeType,
      },
    });

    return destination;
  }

  async getSignedUrl(
    destination: string,
    expiresInMinutes: number,
  ): Promise<string> {
    const file = this.bucket.file(destination);

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return url;
  }

  async delete(destination: string): Promise<void> {
    try {
      await this.bucket.file(destination).delete();
      this.logger.info("Deleted file from storage", { destination });
    } catch (error) {
      this.logger.warn("Failed to delete file from storage", {
        destination,
        error: (error as Error).message,
      });
    }
  }
}
