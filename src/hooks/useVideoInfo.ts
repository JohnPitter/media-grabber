import { useState, useCallback } from "react";
import { api, type VideoInfo } from "@/services/api";

interface UseVideoInfoReturn {
  videoInfo: VideoInfo | null;
  loading: boolean;
  error: string | null;
  fetchVideoInfo: (url: string) => Promise<void>;
  reset: () => void;
}

export function useVideoInfo(): UseVideoInfoReturn {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideoInfo = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const info = await api.getVideoInfo(url);
      setVideoInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch video info");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setVideoInfo(null);
    setError(null);
    setLoading(false);
  }, []);

  return { videoInfo, loading, error, fetchVideoInfo, reset };
}
