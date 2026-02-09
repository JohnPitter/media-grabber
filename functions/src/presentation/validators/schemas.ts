import { z } from "zod";

const URL_MAX_LENGTH = 2048;

export const videoInfoSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .max(URL_MAX_LENGTH, `URL must be at most ${URL_MAX_LENGTH} characters`)
    .url("Invalid URL format")
    .refine(
      (url) => {
        const pattern =
          /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|instagram\.com)\//;
        return pattern.test(url);
      },
      { message: "Only YouTube and Instagram URLs are supported" },
    ),
});

export const downloadSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .max(URL_MAX_LENGTH, `URL must be at most ${URL_MAX_LENGTH} characters`)
    .url("Invalid URL format"),
  formatId: z
    .string()
    .min(1, "Format ID is required")
    .max(100, "Format ID too long")
    .regex(/^[\w+-]+$/, "Invalid format ID"),
});

export type VideoInfoInput = z.infer<typeof videoInfoSchema>;
export type DownloadInput = z.infer<typeof downloadSchema>;
