"use client";

import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-sm text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
        <p>
          <span className="font-semibold text-foreground">TeliPally</span> — free live TV streaming,
          no subscription, no sign-up.
        </p>
        <p className="flex items-center gap-1.5">
          Made with <Heart aria-hidden="true" className="size-3.5 fill-red-500 text-red-500" /> for
          global TV · data from{" "}
          <a
            href="https://github.com/iptv-org/iptv"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline underline-offset-4"
          >
            iptv-org
          </a>
        </p>
      </div>
    </footer>
  );
}
