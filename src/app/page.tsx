"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { History, Search as SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { BottomNav, type AppView } from "@/components/telipally/bottom-nav";
import { ChannelCard } from "@/components/telipally/channel-card";
import { ChannelGrid } from "@/components/telipally/channel-grid";
import { FavoritesView } from "@/components/telipally/favorites-view";
import { FilterBar } from "@/components/telipally/filter-bar";
import { Footer } from "@/components/telipally/footer";
import { Header } from "@/components/telipally/header";
import { Hero } from "@/components/telipally/hero";
import { PlayerDialog } from "@/components/telipally/player-dialog";
import { SettingsView } from "@/components/telipally/settings-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchChannels, fetchCategories, fetchCountries, fetchMeta } from "@/lib/api";
import { useMounted } from "@/hooks/use-mounted";
import { useRecents, useSettings, useWatchlist } from "@/lib/store";
import type { Channel } from "@/lib/types";

const PAGE_SIZE = 40;

export default function Home() {
  const [view, setView] = useState<AppView>("browse");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [category, setCategory] = useState("all");
  const [playerChannel, setPlayerChannel] = useState<Channel | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const mounted = useMounted();

  const watchlistIds = useWatchlist((s) => s.ids);
  const watchlistItems = useWatchlist((s) => s.items);
  const recentsItems = useRecents((s) => s.items);
  const addRecent = useRecents((s) => s.add);
  const autoplay = useSettings((s) => s.autoplay);

  // ---------- server data ----------
  const categoriesQ = useQuery({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: Infinity });
  const countriesQ = useQuery({ queryKey: ["countries"], queryFn: fetchCountries, staleTime: Infinity });
  const metaQ = useQuery({ queryKey: ["meta"], queryFn: fetchMeta, staleTime: 60_000 });

  const browseQ = useInfiniteQuery({
    queryKey: ["channels", "browse", country, category],
    queryFn: ({ pageParam }) => fetchChannels({ country, category, page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });

  const trimmedSearch = search.trim();
  const searchQ = useInfiniteQuery({
    queryKey: ["channels", "search", trimmedSearch],
    queryFn: ({ pageParam }) => fetchChannels({ q: trimmedSearch, page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: trimmedSearch.length > 0,
    placeholderData: keepPreviousData,
  });

  // ---------- derived ----------
  const lookups = useMemo(
    () => ({
      countries: new Map(
        (countriesQ.data?.items ?? []).map((c) => [c.code, { name: c.name, flag: c.flag }]),
      ),
      categories: new Map((categoriesQ.data?.items ?? []).map((c) => [c.id, c.name])),
    }),
    [countriesQ.data, categoriesQ.data],
  );

  const favoriteIds = useMemo(() => new Set(mounted ? watchlistIds : []), [mounted, watchlistIds]);
  const browseChannels = useMemo(
    () => browseQ.data?.pages.flatMap((p) => p.items) ?? [],
    [browseQ.data],
  );
  const searchChannels = useMemo(
    () => searchQ.data?.pages.flatMap((p) => p.items) ?? [],
    [searchQ.data],
  );
  const recents = useMemo(() => (mounted ? recentsItems : []), [mounted, recentsItems]);
  const browseTotal = browseQ.data?.pages[0]?.total ?? 0;
  const searchTotal = searchQ.data?.pages[0]?.total ?? 0;

  // ---------- effects ----------
  // Support deep links like /?view=favorites from the PWA shortcuts.
  // Read once after hydration (deferred to a microtask to avoid sync setState in effect).
  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("view");
      if (requested === "favorites" || requested === "settings" || requested === "search") {
        setView(requested);
      }
    });
  }, []);

  // ---------- handlers ----------
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (value.trim()) {
      setView("search");
    } else {
      setView((current) => (current === "search" ? "browse" : current));
    }
  }, []);

  const openPlayer = useCallback(
    (channel: Channel) => {
      setPlayerChannel(channel);
      setPlayerOpen(true);
      addRecent(channel);
    },
    [addRecent],
  );

  const toggleFavorite = useCallback((channel: Channel) => {
    const wasFavorite = useWatchlist.getState().ids.includes(channel.id);
    useWatchlist.getState().toggle(channel);
    if (wasFavorite) {
      toast(`${channel.name} removed from favorites`);
    } else {
      toast.success(`${channel.name} added to favorites`);
    }
  }, []);

  const countryLabelFor = useCallback(
    (channel: Channel) => {
      const c = lookups.countries.get(channel.country);
      return c ? `${c.flag} ${c.name}` : channel.country;
    },
    [lookups],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header searchValue={search} onSearchChange={handleSearchChange} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 md:px-6 md:pb-10">
        {/* ---------------- Browse ---------------- */}
        {view === "browse" && (
          <div className="space-y-6">
            <Hero
              meta={metaQ.data}
              onSearch={(value) => {
                setSearch(value);
                if (value.trim()) setView("search");
              }}
            />

            <FilterBar
              categories={categoriesQ.data?.items}
              countries={countriesQ.data?.items}
              selectedCategory={category}
              selectedCountry={country}
              onCategoryChange={setCategory}
              onCountryChange={setCountry}
            />

            {recents.length > 0 && (
              <section aria-label="Continue watching" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <History aria-hidden="true" className="size-5 text-primary" />
                    Continue watching
                  </h2>
                </div>
                <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
                  {recents.map((r) => (
                    <ChannelCard
                      key={r.channel.id}
                      channel={r.channel}
                      lookups={lookups}
                      isFavorite={favoriteIds.has(r.channel.id)}
                      onPlay={openPlayer}
                      onToggleFavorite={toggleFavorite}
                      compact
                    />
                  ))}
                </div>
              </section>
            )}

            <section aria-label="Channel catalog" className="space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {country === "all" ? "All countries" : lookups.countries.get(country)?.name ?? country}
                  {" · "}
                  {category === "all" ? "All categories" : lookups.categories.get(category) ?? category}
                </h2>
                <p className="shrink-0 text-sm text-muted-foreground" aria-live="polite">
                  {browseQ.isPending ? "Loading…" : `${browseTotal.toLocaleString()} channels`}
                </p>
              </div>
              <ChannelGrid
                channels={browseChannels}
                lookups={lookups}
                loading={browseQ.isPending}
                loadingMore={browseQ.isFetchingNextPage}
                hasMore={browseQ.hasNextPage}
                favoriteIds={favoriteIds}
                onPlay={openPlayer}
                onToggleFavorite={toggleFavorite}
                onLoadMore={() => browseQ.fetchNextPage()}
              />
            </section>
          </div>
        )}

        {/* ---------------- Search ---------------- */}
        {view === "search" && (
          <div className="space-y-6">
            <div className="relative md:hidden">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search channels…"
                aria-label="Search channels"
                className="h-11 pl-9"
              />
            </div>

            {!trimmedSearch ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
                <SearchIcon aria-hidden="true" className="size-10 text-muted-foreground" />
                <p className="text-base font-semibold">Search the global channel directory</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Type a channel name like “CNN”, “Al Jazeera” or “Sky News”.
                </p>
              </div>
            ) : (
              <section aria-label="Search results" className="space-y-4">
                <h2 className="text-lg font-semibold" aria-live="polite">
                  {searchQ.isPending ? "Searching…" : `${searchTotal.toLocaleString()} results for “${trimmedSearch}”`}
                </h2>
                <ChannelGrid
                  channels={searchChannels}
                  lookups={lookups}
                  loading={searchQ.isPending}
                  loadingMore={searchQ.isFetchingNextPage}
                  hasMore={searchQ.hasNextPage}
                  favoriteIds={favoriteIds}
                  emptyTitle={`No channels match “${trimmedSearch}”`}
                  emptyHint="Check the spelling or try a shorter name."
                  onPlay={openPlayer}
                  onToggleFavorite={toggleFavorite}
                  onLoadMore={() => searchQ.fetchNextPage()}
                />
              </section>
            )}
          </div>
        )}

        {/* ---------------- Favorites ---------------- */}
        {view === "favorites" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Your favorites</h2>
            <FavoritesView lookups={lookups} onPlay={openPlayer} onToggleFavorite={toggleFavorite} />
          </div>
        )}

        {/* ---------------- Settings ---------------- */}
        {view === "settings" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Settings</h2>
            <SettingsView />
          </div>
        )}
      </main>

      <Footer />
      <BottomNav view={view} onViewChange={setView} favoritesCount={mounted ? watchlistIds.length : 0} />

      <PlayerDialog
        channel={playerChannel}
        open={playerOpen}
        onOpenChange={setPlayerOpen}
        isFavorite={playerChannel ? favoriteIds.has(playerChannel.id) : false}
        onToggleFavorite={toggleFavorite}
        autoplay={autoplay}
        countryLabel={playerChannel ? countryLabelFor(playerChannel) : undefined}
      />
    </div>
  );
}
