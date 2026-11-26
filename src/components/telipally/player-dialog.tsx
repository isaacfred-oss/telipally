"use client";

import Hls from "hls.js";
import { Heart, Loader2, RefreshCw, TriangleAlert, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Channel } from "@/lib/types";
import { languageName } from "@/lib/languages";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PlayerStatus = "loading" | "playing" | "error";

interface PlayerDialogProps {
  channel: Channel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: (channel: Channel) => void;
  autoplay?: boolean;
  /** Preformatted country label, e.g. "🇺🇸 United States" */
  countryLabel?: string;
}

const CONNECT_TIMEOUT_MS = 15000;

export function PlayerDialog({
  channel,
  open,
  onOpenChange,
  isFavorite,
  onToggleFavorite,
  autoplay = true,
  countryLabel,
}: PlayerDialogProps) {
  const [attempt, setAttempt] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-x-hidden overflow-y-auto p-0 sm:max-w-3xl" aria-describedby={undefined}>
        {channel && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{channel.name}</DialogTitle>
              <DialogDescription>Live stream player for {channel.name}</DialogDescription>
            </DialogHeader>

            <PlayerBody
              key={`${channel.id}:${attempt}`}
              channel={channel}
              autoplay={autoplay}
              onRetry={() => setAttempt((a) => a + 1)}
            />

            {/* Info */}
            <div className="flex min-w-0 items-start gap-4 p-4 sm:p-6">
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt={`${channel.name} logo`}
                  className="h-12 w-12 shrink-0 rounded-md border border-border bg-muted object-contain p-1"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden="true">
                    <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
                  </svg>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-white" />
                    Live
                  </span>
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                    {channel.quality}
                  </span>
                  {channel.is247 && (
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                      24/7
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 truncate text-lg font-semibold leading-6">{channel.name}</h3>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {countryLabel ? `${countryLabel} · ` : ""}
                  {channel.categories.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(" · ")}
                  {channel.language ? ` · ${languageName(channel.language)}` : ""}
                </p>
              </div>

              <Button
                variant="outline"
                size="icon"
                className={cn("size-11 shrink-0", isFavorite && "border-red-300 text-red-500")}
                aria-label={isFavorite ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}
                aria-pressed={isFavorite}
                onClick={() => onToggleFavorite(channel)}
              >
                <Heart aria-hidden="true" className={cn("size-5", isFavorite && "fill-current")} />
              </Button>
            </div>

            <p className="min-w-0 px-4 pb-4 text-xs text-muted-foreground sm:px-6 sm:pb-6">
              Stream sourced from the open iptv-org directory. Availability and quality depend on the
              broadcaster. Volume <Volume2 aria-hidden="true" className="inline size-3 align-[-1px]" /> controls are on the video itself.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Wired per (channel, attempt) via `key` so state resets cleanly on retry
 * without synchronous setState calls inside effects.
 */
function PlayerBody({
  channel,
  autoplay,
  onRetry,
}: {
  channel: Channel;
  autoplay: boolean;
  onRetry: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [mutedByPolicy, setMutedByPolicy] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlaying = () => {
      setStatus("playing");
      setShowControls(true);
      setMutedByPolicy((m) => (video.muted ? m : false));
    };
    const onWaiting = () => setStatus((s) => (s === "playing" ? "loading" : s));
    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);

    const tryPlay = () => {
      video
        .play()
        .then(() => setMutedByPolicy(false))
        .catch(() => {
          // Autoplay with sound blocked — retry muted and offer an unmute button
          video.muted = true;
          video
            .play()
            .then(() => setMutedByPolicy(true))
            .catch(() => setStatus("error"));
        });
    };

    const nativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";
    let hls: Hls | null = null;

    if (Hls.isSupported() && !nativeHls) {
      hls = new Hls({
        enableWorker: true,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 2,
        fragLoadingMaxRetry: 3,
      });
      hlsRef.current = hls;
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) tryPlay();
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
            setStatus("error");
          } else {
            hls?.startLoad();
          }
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls?.recoverMediaError();
        } else {
          setStatus("error");
        }
      });
      hls.loadSource(channel.stream);
      hls.attachMedia(video);
    } else {
      video.src = channel.stream;
      if (autoplay) tryPlay();
    }

    video.onerror = () => setStatus("error");

    const timeoutId = window.setTimeout(() => {
      setStatus((s) => (s === "loading" ? "error" : s));
    }, CONNECT_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.onerror = null;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [channel.stream, autoplay]);

  const handleUnmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMutedByPolicy(false);
  };

  return (
    <div className="relative aspect-video w-full min-w-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        playsInline
        controls={showControls}
        aria-label={`Live stream of ${channel.name}`}
      />

      {status === "loading" && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white"
        >
          <Loader2 aria-hidden="true" className="size-9 animate-spin" />
          <p className="text-sm text-white/80">Connecting to {channel.name}…</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center text-white">
          <TriangleAlert aria-hidden="true" className="size-10 text-amber-400" />
          <div>
            <p className="font-semibold">Stream unavailable</p>
            <p className="mt-1 text-sm text-white/70">
              This channel may be offline right now. Try again or pick another channel.
            </p>
          </div>
          <Button
            onClick={onRetry}
            className="min-h-11 bg-white px-5 text-[#1a365d] hover:bg-white/90"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Retry
          </Button>
        </div>
      )}

      {mutedByPolicy && status === "playing" && (
        <button
          onClick={handleUnmute}
          className="absolute bottom-16 left-1/2 z-10 flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-4 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <VolumeX aria-hidden="true" className="size-4" />
          Tap to unmute
        </button>
      )}
    </div>
  );
}
