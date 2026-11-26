"use client";

import { Download, Info, Languages, Palette, PlayCircle, Trash2, Wifi, Smartphone } from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { InstallButton } from "@/components/telipally/install-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { fetchMeta } from "@/lib/api";
import { useMounted } from "@/hooks/use-mounted";
import { usePwa, useRecents, useSettings, useWatchlist } from "@/lib/store";

function detectIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && typeof document !== "undefined" && "ontouchend" in document);
}

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const autoplay = useSettings((s) => s.autoplay);
  const setAutoplay = useSettings((s) => s.setAutoplay);
  const englishOnly = useSettings((s) => s.englishOnly);
  const setEnglishOnly = useSettings((s) => s.setEnglishOnly);
  const clearWatchlist = useWatchlist((s) => s.clear);
  const watchlistCount = useWatchlist((s) => s.ids.length);
  const recentsCount = useRecents((s) => s.items.length);
  const clearRecents = useRecents((s) => s.clear);
  const installed = usePwa((s) => s.installed);
  const isIos = useMounted() && detectIos();
  const mounted = useMounted();

  const metaQ = useQuery({ queryKey: ["meta"], queryFn: fetchMeta, staleTime: 60_000 });


  const handleClearFavorites = () => {
    clearWatchlist();
    toast.success("Favorites cleared");
  };

  const handleClearRecents = () => {
    clearRecents();
    toast.success("Watch history cleared");
  };

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette aria-hidden="true" className="size-4 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>Choose how TeliPally looks on this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <Label htmlFor="theme-select" className="text-sm font-normal text-muted-foreground">
            Theme
          </Label>
          <Select value={mounted ? (theme ?? "system") : "system"} onValueChange={setTheme}>
            <SelectTrigger id="theme-select" aria-label="Theme" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Languages aria-hidden="true" className="size-4 text-primary" />
            Content
          </CardTitle>
          <CardDescription>Choose which channels appear in your guide.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="english-only" className="text-sm">
              English channels only
            </Label>
            <p className="text-sm font-normal text-muted-foreground">
              Hide channels that are not broadcast in English. You can also toggle this from the filter bar.
            </p>
          </div>
          <Switch
            id="english-only"
            checked={mounted ? englishOnly : true}
            onCheckedChange={setEnglishOnly}
            aria-label="English channels only"
          />
        </CardContent>
      </Card>

      {/* Playback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PlayCircle aria-hidden="true" className="size-4 text-primary" />
            Playback
          </CardTitle>
          <CardDescription>Control what happens when you open a channel.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="autoplay" className="text-sm">
              Start playing automatically
            </Label>
            <p className="text-sm font-normal text-muted-foreground">
              If your browser blocks autoplay, the stream starts muted — tap to unmute.
            </p>
          </div>
          <Switch
            id="autoplay"
            checked={mounted ? autoplay : true}
            onCheckedChange={setAutoplay}
            aria-label="Start playing automatically"
          />
        </CardContent>
      </Card>

      {/* Install */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone aria-hidden="true" className="size-4 text-primary" />
            Install app
          </CardTitle>
          <CardDescription>
            Install TeliPally as an app for instant access, a dedicated window and offline shell.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mounted && installed ? (
            <p className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
              <span aria-hidden="true">✔</span> TeliPally is installed on this device.
            </p>
          ) : mounted && isIos ? (
            <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
              <li>Open TeliPally in Safari</li>
              <li>Tap the Share button</li>
              <li>Choose “Add to Home Screen”</li>
            </ol>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <InstallButton />
              <p className="text-sm text-muted-foreground">
                <Download aria-hidden="true" className="mr-1 inline size-3.5 align-[-2px]" />
                Available in Chrome, Edge and other Chromium browsers via the install button.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data & storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi aria-hidden="true" className="size-4 text-primary" />
            Data & storage
          </CardTitle>
          <CardDescription>
            Channel data comes from the open-source{" "}
            <a
              href="https://github.com/iptv-org/iptv"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              iptv-org
            </a>{" "}
            directory and is refreshed periodically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <dt className="text-xs text-muted-foreground">Channels</dt>
              <dd className="mt-1 text-lg font-semibold">
                {metaQ.data ? metaQ.data.stats.channels.toLocaleString() : "—"}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <dt className="text-xs text-muted-foreground">Countries</dt>
              <dd className="mt-1 text-lg font-semibold">{metaQ.data?.stats.countries ?? "—"}</dd>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <dt className="text-xs text-muted-foreground">Categories</dt>
              <dd className="mt-1 text-lg font-semibold">{metaQ.data?.stats.categories ?? "—"}</dd>
            </div>
          </dl>

          {metaQ.data && (
            <p className="text-xs text-muted-foreground">
              Source: {metaQ.data.source} · data origin:{" "}
              {metaQ.data.dataOrigin === "remote" ? "live refresh" : "bundled snapshot"} · updated{" "}
              {new Date(metaQ.data.generatedAt).toLocaleString()}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleClearFavorites}
              disabled={!mounted || watchlistCount === 0}
              className="min-h-11"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Clear favorites {mounted ? `(${watchlistCount})` : ""}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearRecents}
              disabled={!mounted || recentsCount === 0}
              className="min-h-11"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Clear watch history {mounted ? `(${recentsCount})` : ""}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info aria-hidden="true" className="size-4 text-primary" />
            About TeliPally
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            TeliPally is a free, installable live TV app. It indexes publicly available streams from the
            iptv-org community directory and organizes them by country and category.
          </p>
          <p>Version 1.0.0 · Built with Next.js · No account required, no tracking.</p>
        </CardContent>
      </Card>
    </div>
  );
}
