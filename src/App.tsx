import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { VideoSearch } from "@/components/VideoSearch";
import { VideoPreview } from "@/components/VideoPreview";
import { VideoEmbed } from "@/components/VideoEmbed";
import { DownloadOptions } from "@/components/DownloadOptions";
import { DownloadProgress } from "@/components/DownloadProgress";
import { DownloadHistory } from "@/components/DownloadHistory";
import { useVideoInfo } from "@/hooks/useVideoInfo";
import { useDownload } from "@/hooks/useDownload";
import { useHistory } from "@/hooks/useHistory";
import { Card, CardContent } from "@/components/ui/card";

export function App() {
  const { videoInfo, loading: infoLoading, error: infoError, fetchVideoInfo } = useVideoInfo();
  const { downloadResult, loading: downloadLoading, error: downloadError, startDownload } = useDownload();
  const { history, addEntry, removeEntry, clearHistory } = useHistory();
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");

  function handleSearch(url: string) {
    setCurrentUrl(url);
    fetchVideoInfo(url);
  }

  function handleDownload(formatId: string) {
    if (!currentUrl || !videoInfo) return;
    setSelectedFormatId(formatId);
    startDownload(currentUrl, formatId);

    addEntry({
      url: currentUrl,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      platform: videoInfo.platform,
      duration: videoInfo.duration,
      uploader: videoInfo.uploader,
    });
  }

  const error = infoError || downloadError;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <img src="/icon.svg" alt="Grabber" className="mx-auto h-24 w-24" />
          <h1 className="text-3xl font-bold tracking-tight">Grabber</h1>
          <p className="text-muted-foreground">
            The little frog that catches your videos
          </p>
        </div>

        <VideoSearch onSearch={handleSearch} loading={infoLoading} />

        {!videoInfo && !infoLoading && !error && (
          <DownloadHistory
            entries={history}
            onSelect={handleSearch}
            onRemove={removeEntry}
            onClear={clearHistory}
          />
        )}

        {infoLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="space-y-2 text-center">
                  <p className="font-medium">Buscando video...</p>
                  <p className="text-sm text-muted-foreground">
                    Isso pode levar alguns segundos
                  </p>
                </div>
                <div className="w-full space-y-3 pt-2">
                  <div className="flex gap-4">
                    <div className="h-24 w-40 shrink-0 animate-pulse rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {videoInfo && (
          <>
            <VideoEmbed url={currentUrl} platform={videoInfo.platform} />
            <VideoPreview video={videoInfo} />
            <DownloadOptions
              formats={videoInfo.formats}
              onDownload={handleDownload}
              loading={downloadLoading}
              selectedFormatId={selectedFormatId}
            />
          </>
        )}

        {downloadResult && <DownloadProgress result={downloadResult} />}
      </div>
    </Layout>
  );
}
