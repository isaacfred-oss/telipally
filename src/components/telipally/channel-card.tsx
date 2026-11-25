"use client";

import { motion } from "framer-motion";
import { Heart, Tv } from "lucide-react";
import { useState } from "react";

import type { Channel } from "@/lib/types";
import { languageName } from "@/lib/languages";
import { cn } from "@/lib/utils";

export interface Lookups {
  countries: Map<string, { name: string; flag: string }>;
  categories: Map<string, string>;
}

interface ChannelCardProps {
  channel: Channel;
  lookups: Lookups;
  isFavorite: boolean;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (channel: Channel) => void;
  compact?: boolean;
}

export function ChannelCard({ channel, lookups, isFavorite, onPlay, onToggleFavorite, compact }: ChannelCardProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const country = lookups.countries.get(channel.country);
  const categoryNames = channel.categories
    .map((id) => lookups.categories.get(id))
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");
  const language = languageName(channel.language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(compact && "w-44 shrink-0 snap-start")}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Play ${channel.name}`}
        onClick={() => onPlay(channel)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPlay(channel);
          }
        }}
        className="group h-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Logo area */}
        <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted">
          {channel.logo && !logoFailed ? (
            <img
              src={channel.logo}
              alt={`${channel.name} logo`}
              loading="lazy"
              onError={() => setLogoFailed(true)}
              className="max-h-[62%] max-w-[78%] object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <Tv aria-hidden="true" className="size-8" />
              <span className="text-sm font-semibold">{channel.name}</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-red-600/95 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-white" />
              Live
            </span>
            {channel.is247 && (
              <span className="rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                24/7
              </span>
            )}
          </div>

          {/* Favorite */}
          <button
            aria-label={isFavorite ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}
            aria-pressed={isFavorite}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel);
            }}
            className={cn(
              "absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-black/45 backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isFavorite ? "text-red-500" : "text-white hover:bg-black/65",
            )}
          >
            <Heart aria-hidden="true" className={cn("size-4", isFavorite && "fill-current")} />
          </button>

          {/* Play overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
              <svg viewBox="0 0 24 24" className="ml-0.5 size-5 fill-current" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="p-3">
          <p className="truncate text-sm font-semibold leading-5" title={channel.name}>
            {channel.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {country ? `${country.flag} ${country.name}` : channel.country}
            {categoryNames ? ` · ${categoryNames}` : ""}
            {language ? ` · ${language}` : ""}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
