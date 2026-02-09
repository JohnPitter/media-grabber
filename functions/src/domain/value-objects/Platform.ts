export enum Platform {
  YOUTUBE = "youtube",
  INSTAGRAM = "instagram",
}

const YOUTUBE_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
  /^https?:\/\/youtu\.be\/[\w-]+/,
  /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
];

const INSTAGRAM_PATTERNS = [
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels)\/[\w-]+/,
];

export function detectPlatform(url: string): Platform | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    if (pattern.test(url)) return Platform.YOUTUBE;
  }
  for (const pattern of INSTAGRAM_PATTERNS) {
    if (pattern.test(url)) return Platform.INSTAGRAM;
  }
  return null;
}
