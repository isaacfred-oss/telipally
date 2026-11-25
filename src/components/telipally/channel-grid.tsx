"use client";

import { Loader2, SearchX } from "lucide-react";

import type { Channel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChannelCard, type Lookups } from "@/components/telipally/channel-card";

interface ChannelGridProps {
  channels: Channel[];
  lookups: Lookups;
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  favoriteIds: Set<string>;
  emptyTitle?: string;
  emptyHint?: string;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (channel: Channel) => void;
  onLoadMore?: () => void;
}

const SKELETON_COUNT = 8;

export function ChannelGrid({
  channels,
  lookups,
  loading,
  loadingMore,
  hasMore,
  favoriteIds,
  emptyTitle = "No channels found",
  emptyHint = "Try a different search term or reset the filters.",
  onPlay,
  onToggleFavorite,
  onLoadMore,
}: ChannelGridProps) {
  if (loading && channels.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading channels">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
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

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <SearchX aria-hidden="true" className="size-10 text-muted-foreground" />
        <p className="text-base font-semibold">{emptyTitle}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            lookups={lookups}
            isFavorite={favoriteIds.has(channel.id)}
            onPlay={onPlay}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
        {loadingMore &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`more-${i}`} className="overflow-hidden rounded-xl border border-border bg-card">
              <Skeleton className="aspect-video rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" size="lg" onClick={onLoadMore} disabled={loadingMore} className="min-h-11 min-w-44">
            {loadingMore ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more channels"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
