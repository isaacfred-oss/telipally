"use client";

import { Languages } from "lucide-react";

import type { CategoriesResponse, CountriesResponse } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  categories: CategoriesResponse["items"] | undefined;
  countries: CountriesResponse["items"] | undefined;
  selectedCategory: string;
  selectedCountry: string;
  englishOnly: boolean;
  onEnglishOnlyChange: (value: boolean) => void;
  onCategoryChange: (category: string) => void;
  onCountryChange: (country: string) => void;
}

export function FilterBar({
  categories,
  countries,
  selectedCategory,
  selectedCountry,
  englishOnly,
  onEnglishOnlyChange,
  onCategoryChange,
  onCountryChange,
}: FilterBarProps) {
  return (
    <section aria-label="Filters" className="flex flex-col gap-3">
      {/* Category chips */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by category">
        <FilterChip
          active={selectedCategory === "all"}
          onClick={() => onCategoryChange("all")}
          label="All categories"
        />
        {categories?.map((cat) => (
          <FilterChip
            key={cat.id}
            active={selectedCategory === cat.id}
            onClick={() => onCategoryChange(cat.id)}
            label={`${cat.name} (${cat.count})`}
          />
        ))}
        {!categories &&
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 w-28 rounded-full" />)}
      </div>

      {/* Language + country filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onEnglishOnlyChange(!englishOnly)}
          aria-pressed={englishOnly}
          aria-label="Show English channels only"
          className={cn(
            "flex h-10 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            englishOnly
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          <Languages aria-hidden="true" className="size-4" />
          English only
        </button>
        <Select value={selectedCountry} onValueChange={onCountryChange}>
          <SelectTrigger
            aria-label="Filter by country"
            className="h-10 w-[240px] max-w-full shrink-0 bg-card"
          >
            <SelectValue placeholder="All countries" />
          </SelectTrigger>
          <SelectContent className="max-h-[320px]">
            <SelectItem value="all">🌐 All countries</SelectItem>
            {countries?.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(selectedCategory !== "all" || selectedCountry !== "all") && (
          <button
            onClick={() => {
              onCategoryChange("all");
              onCountryChange("all");
            }}
            className="h-10 rounded-md px-3 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reset filters
          </button>
        )}
      </div>
    </section>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
