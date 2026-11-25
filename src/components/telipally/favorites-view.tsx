"use client";

import { Heart } from "lucide-react";

import { ChannelGrid } from "@/components/telipally/channel-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { useWatchlist } from "@/lib/store";
import type { Channel } from "@/lib/types";
import type { Lookups } from "@/components/telipally/channel-card";

interface FavoritesViewProps {
  lookups: Lookups;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (channel: Channel) => void;
}

export function FavoritesView({ lookups, onPlay, onToggleFavorite }: FavoritesViewProps) {
  const ids = useWatchlist((s) => s.ids);
  const items = useWatchlist((s) => s.items);
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
            <Skeleton className="aspect-video rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const favorites = ids
    .map((id) => items[id])
    .filter((ch): ch is NonNullable<typeof ch> => Boolean(ch));

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <Heart aria-hidden="true" className="size-10 text-muted-foreground" />
        <p className="text-base font-semibold">No favorites yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tap the heart on any channel to save it here for quick access.
        </p>
      </div>
    );
  }

  const favoriteIds = new Set(ids);

  return (
    <ChannelGrid
      channels={favorites}
      lookups={lookups}
      loading={false}
      favoriteIds={favoriteIds}
      onPlay={onPlay}
      onToggleFavorite={onToggleFavorite}
    />
  );
}
