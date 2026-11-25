"use client";

import { Heart, House, Search, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

export type AppView = "browse" | "search" | "favorites" | "settings";

interface BottomNavProps {
  view: AppView;
  onViewChange: (view: AppView) => void;
  favoritesCount: number;
}

const TABS: Array<{ id: AppView; label: string; icon: typeof House }> = [
  { id: "browse", label: "Home", icon: House },
  { id: "search", label: "Search", icon: Search },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
];

export function BottomNav({ view, onViewChange, favoritesCount }: BottomNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="relative">
                <Icon aria-hidden="true" className="size-5" />
                {tab.id === "favorites" && favoritesCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white"
                  >
                    {favoritesCount > 9 ? "9+" : favoritesCount}
                  </span>
                )}
              </span>
              {tab.label}
              {active && <span aria-hidden="true" className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
