import { onRequest } from "firebase-functions/v2/https";
import { v4 as uuidv4 } from "uuid";
import { GetVideoInfo } from "../../application/use-cases/GetVideoInfo";
import { YtDlpDownloader } from "../../infrastructure/downloaders/YtDlpDownloader";
import { FirestoreCacheService } from "../../infrastructure/cache/FirestoreCacheService";
import { PinoLogger } from "../../infrastructure/logging/PinoLogger";
import { corsHandler } from "../middlewares/corsHandler";
import { checkRateLimit } from "../middlewares/rateLimiter";
import { handleError } from "../middlewares/errorHandler";
import { videoInfoSchema } from "../validators/schemas";

const logger = new PinoLogger({ service: "getVideoInfo" });

export const getVideoInfo = onRequest(
  {
    region: "us-east1",
    memory: "512MiB",
    timeoutSeconds: 60,
    maxInstances: 10,
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

        const body = videoInfoSchema.parse(req.body);

        const downloader = new YtDlpDownloader(logger);
        const cache = new FirestoreCacheService(logger);
        const useCase = new GetVideoInfo(downloader, cache, logger);

        const result = await useCase.execute({ url: body.url }, requestId);

        logger.info("Video info response sent", {
          requestId,
          videoId: result.id,
        });

        res.status(200).json({ data: result, requestId });
      } catch (error) {
        handleError(error, res, logger, requestId);
      }
    });
  },
);
