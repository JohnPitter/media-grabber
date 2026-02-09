import * as admin from "firebase-admin";
import { Request } from "firebase-functions/v2/https";
import { RateLimitError } from "../../domain/entities/errors";
import { ILogger } from "../../domain/interfaces/ILogger";
import { RATE_LIMIT } from "../../shared/constants";

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

export async function checkRateLimit(
  req: Request,
  logger: ILogger,
): Promise<void> {
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.ip ||
    "unknown";

  const sanitizedIp = ip.replace(/[^a-zA-Z0-9.:]/g, "_");
  const key = `rate-limit:${sanitizedIp}`;
  const docRef = admin.firestore().collection("rate-limits").doc(key);

  const now = Date.now();

  const doc = await docRef.get();
  const data = doc.data() as RateLimitRecord | undefined;

  if (!data || now - data.windowStart > RATE_LIMIT.WINDOW_SECONDS * 1000) {
    await docRef.set({ count: 1, windowStart: now });
    return;
  }

  if (data.count >= RATE_LIMIT.MAX_REQUESTS) {
    logger.warn("Rate limit exceeded", { ip: sanitizedIp, count: data.count });
    throw new RateLimitError();
  }

  await docRef.update({
    count: admin.firestore.FieldValue.increment(1),
  });
}
