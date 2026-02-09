import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { VideoSearch } from "@/components/VideoSearch";
import { VideoPreview } from "@/components/VideoPreview";
import { DownloadOptions } from "@/components/DownloadOptions";
import { DownloadProgress } from "@/components/DownloadProgress";
import { useVideoInfo } from "@/hooks/useVideoInfo";
import { useDownload } from "@/hooks/useDownload";
import { Card, CardContent } from "@/components/ui/card";

export function App() {
  const { videoInfo, loading: infoLoading, error: infoError, fetchVideoInfo } = useVideoInfo();
  const { downloadResult, loading: downloadLoading, error: downloadError, startDownload } = useDownload();
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");

  function handleSearch(url: string) {
    setCurrentUrl(url);
    fetchVideoInfo(url);
  }

  function handleDownload(formatId: string) {
    if (!currentUrl) return;
    setSelectedFormatId(formatId);
    startDownload(currentUrl, formatId);
  }

  const error = infoError || downloadError;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Media Grabber</h1>
          <p className="text-muted-foreground">
            Download public videos from YouTube and Instagram
          </p>
        </div>

        <VideoSearch onSearch={handleSearch} loading={infoLoading} />

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
