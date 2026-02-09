import { onRequest } from "firebase-functions/v2/https";
import { v4 as uuidv4 } from "uuid";
import { DownloadVideo } from "../../application/use-cases/DownloadVideo";
import { YtDlpDownloader } from "../../infrastructure/downloaders/YtDlpDownloader";
import { FirestoreCacheService } from "../../infrastructure/cache/FirestoreCacheService";
import { FirebaseStorageService } from "../../infrastructure/storage/FirebaseStorageService";
import { PinoLogger } from "../../infrastructure/logging/PinoLogger";
import { corsHandler } from "../middlewares/corsHandler";
import { checkRateLimit } from "../middlewares/rateLimiter";
import { handleError } from "../middlewares/errorHandler";
import { downloadSchema } from "../validators/schemas";

const logger = new PinoLogger({ service: "downloadVideo" });

export const downloadVideo = onRequest(
  {
    region: "us-east1",
    memory: "2GiB",
    timeoutSeconds: 300,
    maxInstances: 5,
  },
  (req, res) => {
    corsHandler(req, res, async () => {
      const requestId = uuidv4();

      try {
        if (req.method !== "POST") {
          res.status(405).json({ error: { message: "Method not allowed" } });
          return;
        }

        await checkRateLimit(req, logger);

        const body = downloadSchema.parse(req.body);

        const downloader = new YtDlpDownloader(logger);
        const cache = new FirestoreCacheService(logger);
        const storage = new FirebaseStorageService(logger);
        const useCase = new DownloadVideo(
          downloader,
          storage,
          cache,
          logger,
        );

        const result = await useCase.execute(
          { url: body.url, formatId: body.formatId },
          requestId,
        );

        logger.info("Download response sent", {
          requestId,
          fileName: result.fileName,
        });

        res.status(200).json({ data: result, requestId });
      } catch (error) {
        handleError(error, res, logger, requestId);
      }
    });
  },
);
