import type { CategoriesResponse, ChannelsResponse, CountriesResponse, MetaResponse } from "./types";

export interface FetchChannelsParams {
  q?: string;
  country?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: "default" | "name" | "quality";
}

export async function fetchChannels(params: FetchChannelsParams): Promise<ChannelsResponse> {
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.country && params.country !== "all") qs.set("country", params.country);
  if (params.category && params.category !== "all") qs.set("category", params.category);
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 60));
  if (params.sort) qs.set("sort", params.sort);

  const res = await fetch(`/api/channels?${qs.toString()}`);
  if (!res.ok) throw new Error(`Failed to load channels (HTTP ${res.status})`);
  return res.json();
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error(`Failed to load categories (HTTP ${res.status})`);
  return res.json();
}

export async function fetchCountries(): Promise<CountriesResponse> {
  const res = await fetch("/api/countries");
  if (!res.ok) throw new Error(`Failed to load countries (HTTP ${res.status})`);
  return res.json();
}

export async function fetchMeta(): Promise<MetaResponse> {
  const res = await fetch("/api/meta");
  if (!res.ok) throw new Error(`Failed to load app metadata (HTTP ${res.status})`);
  return res.json();
}
