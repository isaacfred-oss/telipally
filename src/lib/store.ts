import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Channel } from "./types";

/** Saved / favorite channels, persisted to localStorage. */
interface WatchlistStore {
  ids: string[];
  items: Record<string, Channel>;
  toggle: (channel: Channel) => void;
  remove: (channelId: string) => void;
  clear: () => void;
}

export const useWatchlist = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      items: {},
      toggle: (channel) => {
        const { ids, items } = get();
        if (ids.includes(channel.id)) {
          const nextItems = { ...items };
          delete nextItems[channel.id];
          set({ ids: ids.filter((id) => id !== channel.id), items: nextItems });
        } else {
          set({ ids: [channel.id, ...ids], items: { ...items, [channel.id]: channel } });
        }
      },
      remove: (channelId) => {
        const { ids, items } = get();
        const nextItems = { ...items };
        delete nextItems[channelId];
        set({ ids: ids.filter((id) => id !== channelId), items: nextItems });
      },
      clear: () => set({ ids: [], items: {} }),
    }),
    { name: "telipally-watchlist", storage: createJSONStorage(() => localStorage) },
  ),
);

/** Recently watched channels (most recent first, capped). */
interface RecentsStore {
  items: Array<{ channel: Channel; at: number }>;
  add: (channel: Channel) => void;
  clear: () => void;
}

const RECENTS_CAP = 12;

export const useRecents = create<RecentsStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (channel) => {
        const rest = get().items.filter((r) => r.channel.id !== channel.id);
        set({ items: [{ channel, at: Date.now() }, ...rest].slice(0, RECENTS_CAP) });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "telipally-recents", storage: createJSONStorage(() => localStorage) },
  ),
);

/** Playback preferences, persisted to localStorage. */
interface SettingsStore {
  autoplay: boolean;
  setAutoplay: (value: boolean) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set, get) => ({
      autoplay: true,
      setAutoplay: (value) => set({ autoplay: value ?? get().autoplay }),
    }),
    { name: "telipally-settings", storage: createJSONStorage(() => localStorage) },
  ),
);

/** PWA install state (not persisted; driven by browser events). */
interface PwaStore {
  promptEvent: BeforeInstallPromptEvent | null;
  installed: boolean;
  setPromptEvent: (event: BeforeInstallPromptEvent | null) => void;
  setInstalled: (value: boolean) => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const usePwa = create<PwaStore>((set) => ({
  promptEvent: null,
  installed: false,
  setPromptEvent: (event) => set({ promptEvent: event }),
  setInstalled: (value) => set({ installed: value }),
}));

export type { BeforeInstallPromptEvent };
