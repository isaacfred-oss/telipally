"use client";

import { motion } from "framer-motion";
import { Globe, Radio, Search, X } from "lucide-react";
import { useState } from "react";

import type { MetaResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroProps {
  meta: MetaResponse | undefined;
  onSearch: (query: string) => void;
}

export function Hero({ meta, onSearch }: HeroProps) {
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  const chips = meta
    ? [
        { icon: Radio, label: `${meta.stats.channels.toLocaleString()} live channels` },
        { icon: Globe, label: `${meta.stats.countries} countries` },
        { icon: Search, label: `${meta.stats.categories} categories` },
      ]
    : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      aria-label="Welcome to TeliPally"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a365d] via-[#1d4f66] to-[#2c7a7b] px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
          <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-red-400" />
          Live TV · Free forever
        </span>

        <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Free live TV from around the world
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
          Browse thousands of global channels by country or category and stream live news, sports and
          entertainment — no subscription, no sign-up.
        </p>

        {chips.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Directory stats">
            {chips.map((chip) => (
              <li
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90"
              >
                <chip.icon aria-hidden="true" className="size-3.5" />
                {chip.label}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={submit} role="search" className="mt-6 flex max-w-xl gap-2" aria-label="Search channels">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search channels…"
              aria-label="Search channels"
              className="h-11 bg-white pl-9 pr-9 text-foreground shadow-sm"
            />
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                aria-label="Clear search"
                onClick={() => {
                  setValue("");
                  onSearch("");
                }}
              >
                <X aria-hidden="true" />
              </Button>
            )}
          </div>
          <Button type="submit" className="h-11 bg-white px-5 text-[#1a365d] hover:bg-white/90">
            Search
          </Button>
        </form>
      </div>
    </motion.section>
  );
}
