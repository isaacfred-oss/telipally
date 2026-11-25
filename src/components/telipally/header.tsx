"use client";

import { Search, X } from "lucide-react";

import { InstallButton } from "@/components/telipally/install-button";
import { ThemeToggle } from "@/components/telipally/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function Header({ searchValue, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-6">
        <a href="/" className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="TeliPally home">
          <img src="/logo.svg" alt="TeliPally logo" width={36} height={36} className="h-9 w-9" />
          <span className="hidden text-xl font-bold tracking-tight sm:block">
            Teli<span className="text-primary">Pally</span>
          </span>
        </a>

        <div className="relative ml-auto hidden w-full max-w-xl md:block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search channels, e.g. CNN, Sky News…"
            aria-label="Search channels"
            className="h-10 pl-9 pr-9"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
            >
              <X aria-hidden="true" />
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <InstallButton className="hidden sm:inline-flex" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
