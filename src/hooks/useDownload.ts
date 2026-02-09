import { useState, useCallback } from "react";
import { api, type DownloadResult } from "@/services/api";

interface UseDownloadReturn {
  downloadResult: DownloadResult | null;
  loading: boolean;
  error: string | null;
  startDownload: (url: string, formatId: string) => Promise<void>;
  reset: () => void;
}

export function useDownload(): UseDownloadReturn {
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDownload = useCallback(async (url: string, formatId: string) => {
    setLoading(true);
    setError(null);
    setDownloadResult(null);

    try {
      const result = await api.downloadVideo(url, formatId);
      setDownloadResult(result);

      // Auto-trigger browser download
      const a = document.createElement("a");
      a.href = result.downloadUrl;
      a.download = result.fileName;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setDownloadResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { downloadResult, loading, error, startDownload, reset };
}
