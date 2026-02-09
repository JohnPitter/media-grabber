import * as admin from "firebase-admin";
import { ICacheService } from "../../domain/interfaces/ICacheService";
import { ILogger } from "../../domain/interfaces/ILogger";

interface CacheDocument {
  data: string;
  expiresAt: number;
  createdAt: number;
}

export class FirestoreCacheService implements ICacheService {
  private readonly collection: admin.firestore.CollectionReference;

  constructor(
    private readonly logger: ILogger,
    collectionName = "cache",
  ) {
    this.collection = admin.firestore().collection(collectionName);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const doc = await this.collection.doc(this.sanitizeKey(key)).get();

      if (!doc.exists) return null;

      const cached = doc.data() as CacheDocument;

      if (cached.expiresAt < Date.now()) {
        await this.delete(key);
        return null;
      }

      return JSON.parse(cached.data) as T;
    } catch (error) {
      this.logger.warn("Cache get failed", {
        key,
        error: (error as Error).message,
      });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      const document: CacheDocument = {
        data: JSON.stringify(value),
        expiresAt: Date.now() + ttlSeconds * 1000,
        createdAt: Date.now(),
      };

      await this.collection.doc(this.sanitizeKey(key)).set(document);
    } catch (error) {
      this.logger.warn("Cache set failed", {
        key,
        error: (error as Error).message,
      });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.collection.doc(this.sanitizeKey(key)).delete();
    } catch (error) {
      this.logger.warn("Cache delete failed", {
        key,
        error: (error as Error).message,
      });
    }
  }

  private sanitizeKey(key: string): string {
    return key.replace(/[/\\#$.\[\]]/g, "_");
  }
}
