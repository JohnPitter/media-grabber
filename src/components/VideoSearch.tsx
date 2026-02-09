import { useState, type FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VideoSearchProps {
  onSearch: (url: string) => void;
  loading: boolean;
}

const URL_PATTERN =
  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|instagram\.com)\//;

export function VideoSearch({ onSearch, loading }: VideoSearchProps) {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError("Please enter a URL");
      return;
    }

    if (!URL_PATTERN.test(trimmed)) {
      setValidationError("Only YouTube and Instagram URLs are supported");
      return;
    }

    onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste YouTube or Instagram video URL..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setValidationError(null);
          }}
          disabled={loading}
          className="flex-1"
          aria-label="Video URL"
        />
        <Button type="submit" disabled={loading || !url.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">
            {loading ? "Searching..." : "Search"}
          </span>
        </Button>
      </div>
      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}
    </form>
  );
}
