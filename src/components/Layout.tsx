import { type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Grabber" className="h-6 w-6" />
            <span className="text-lg font-bold">Grabber</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8">{children}</main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto max-w-3xl px-4">
          Grabber - Download public videos from YouTube and Instagram
        </div>
      </footer>
    </div>
  );
}
