import { useState } from "react";
import { Download, Loader2, FileVideo, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VideoFormat } from "@/services/api";

interface DownloadOptionsProps {
  formats: VideoFormat[];
  onDownload: (formatId: string) => void;
  loading: boolean;
  selectedFormatId: string | null;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function DownloadOptions({
  formats,
  onDownload,
  loading,
  selectedFormatId,
}: DownloadOptionsProps) {
  const [filter, setFilter] = useState<"all" | "video" | "audio">("all");

  // Group and sort: video+audio first, then video-only, then audio-only
  const filtered = formats.filter((f) => {
    if (filter === "video") return f.hasVideo;
    if (filter === "audio") return f.hasAudio && !f.hasVideo;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const scoreA = (a.hasVideo ? 2 : 0) + (a.hasAudio ? 1 : 0);
    const scoreB = (b.hasVideo ? 2 : 0) + (b.hasAudio ? 1 : 0);
    if (scoreA !== scoreB) return scoreB - scoreA;
    return (b.fileSize || 0) - (a.fileSize || 0);
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Download Options</CardTitle>
          <div className="flex gap-1">
            {(["all", "video", "audio"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No formats available for this filter.
            </p>
          )}
          {sorted.map((format) => (
            <div
              key={format.formatId}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {format.hasVideo ? (
                  <FileVideo className="h-4 w-4 text-primary" />
                ) : (
                  <FileAudio className="h-4 w-4 text-primary" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {format.resolution || format.quality}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      .{format.extension}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(format.fileSize)}
                    {format.hasVideo && format.hasAudio && " | Video + Audio"}
                    {format.hasVideo && !format.hasAudio && " | Video only"}
                    {!format.hasVideo && format.hasAudio && " | Audio only"}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onDownload(format.formatId)}
                disabled={loading}
              >
                {loading && selectedFormatId === format.formatId ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
