import fs from "fs";
import path from "path";

import type { Category, Channel, Country, Dataset } from "@/lib/types";

/**
 * TeliPally channel store (server-only).
 *
 * Data strategy:
 *  1. Boot from a bundled snapshot of the iptv-org directory (works offline / cold starts).
 *  2. Refresh from the live iptv-org API in the background (stale-while-revalidate, 12h TTL).
 *  3. Results are cached in module memory per server instance.
 *
 * Pipeline hygiene (Phase 2):
 *  - https:// streams only (mixed-content safe)
 *  - Streams requiring custom user-agent / referrer headers are dropped (unplayable in <video>)
 *  - Streams labeled "Geo-blocked" are skipped (dead outside their home region)
 *  - Channels in the iptv-org blocklist (DMCA / legal takedowns) are excluded
 *  - NSFW channels are excluded
 *  - HD logos preferred via logos.json scoring
 */

const SNAPSHOT_PATH = path.join(process.cwd(), "src/data/telipally-snapshot.json");
const REMOTE_BASE = "https://iptv-org.github.io/api";
const REMOTE_TTL_MS = 12 * 60 * 60 * 1000;

const QUALITY_RANK: Record<string, number> = {
  "1080p": 6,
  "720p": 5,
  "480p": 4,
  "360p": 3,
  "240p": 2,
};

interface RawStream {
  channel: string | null;
  url: string;
  quality?: string;
  labels?: string[];
  user_agent?: string | null;
  referrer?: string | null;
}

interface RawLogo {
  channel: string | null;
  url: string;
  in_use?: boolean;
  format?: string;
  width?: number;
}

interface RawBlocklistEntry {
  channel?: string | null;
  reason?: string;
}

interface RawFeed {
  channel: string | null;
  is_main?: boolean;
  languages?: string[];
}

interface RawChannel {
  id: string;
  name: string;
  country: string | null;
  categories?: string[];
  is_nsfw?: boolean;
}

interface RawData {
  channels: RawChannel[];
  streams: RawStream[];
  categories: Array<{ id: string; name: string; description?: string | null }>;
  countries: Array<{ name: string; code: string; flag?: string }>;
  feeds: RawFeed[];
  logos: RawLogo[];
  blocklist: RawBlocklistEntry[];
}

interface Store {
  dataset: Dataset;
  catCounts: Map<string, number>;
  countryCounts: Map<string, number>;
  loadedAt: number;
  refreshing: boolean;
  dataOrigin: "remote" | "snapshot";
}

let store: Store | null = null;

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildCounts(channels: Channel[]): { catCounts: Map<string, number>; countryCounts: Map<string, number> } {
  const catCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  for (const ch of channels) {
    countryCounts.set(ch.country, (countryCounts.get(ch.country) ?? 0) + 1);
    for (const c of ch.categories) catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
  }
  return { catCounts, countryCounts };
}

function makeStore(dataset: Dataset, dataOrigin: "remote" | "snapshot"): Store {
  const counts = buildCounts(dataset.channels);
  return { dataset, ...counts, loadedAt: Date.now(), refreshing: false, dataOrigin };
}

/** Deterministically builds the working dataset from raw iptv-org API payloads. */
export function buildDataset(raw: RawData, generatedAt: string, source: string): Dataset {
  const QUALITY_BONUS = 100;
  const ALLDAY_BONUS = 50;
  const M3U8_BONUS = 20;

  // DMCA / legal takedowns: never serve these channels (iptv-org blocklist.json).
  const blockedChannels = new Set(
    raw.blocklist.map((e) => e.channel).filter((id): id is string => Boolean(id)),
  );

  const bestStreams = new Map<string, { score: number; url: string; quality: string; is247: boolean }>();
  for (const s of raw.streams) {
    if (!s.channel || !s.url) continue;
    if (!/^https:\/\//i.test(s.url)) continue; // https only (mixed-content safe)
    if (s.user_agent || s.referrer) continue; // needs special headers -> unusable in browser
    if ((s.labels ?? []).includes("Geo-blocked")) continue; // dead outside its home region
    const score =
      (QUALITY_RANK[s.quality ?? ""] ?? 1) * QUALITY_BONUS +
      (s.labels && s.labels.includes("Not 24/7") ? 0 : ALLDAY_BONUS) +
      (/\.m3u8($|\?)/i.test(s.url) ? M3U8_BONUS : 0);
    const prev = bestStreams.get(s.channel);
    if (!prev || prev.score < score) {
      bestStreams.set(s.channel, {
        score,
        url: s.url,
        quality: s.quality || "auto",
        is247: !(s.labels ?? []).includes("Not 24/7"),
      });
    }
  }

  const bestLogos = new Map<string, string>();
  const prevScore = new Map<string, number>();
  for (const l of raw.logos) {
    if (!l.channel || !l.url) continue;
    let score = 0;
    if (l.in_use) score += 40;
    if ((l.format ?? "").toUpperCase() === "PNG") score += 30;
    if ((l.width ?? 0) >= 120) score += 20;
    if ((l.width ?? 0) >= 200) score += 10;
    if ((prevScore.get(l.channel) ?? -1) < score) {
      prevScore.set(l.channel, score);
      bestLogos.set(l.channel, l.url);
    }
  }

  const langByChannel = new Map<string, string>();
  for (const f of raw.feeds) {
    if (!f.channel || !f.languages || !f.languages.length) continue;
    const existing = langByChannel.get(f.channel);
    if (!existing || (f.is_main && !existing)) langByChannel.set(f.channel, f.languages[0]);
  }

  const usedCountryCodes = new Set<string>();
  const channels: Channel[] = [];
  for (const c of raw.channels) {
    if (!c.country || c.is_nsfw) continue;
    if (blockedChannels.has(c.id)) continue; // DMCA / legal takedown
    const st = bestStreams.get(c.id);
    if (!st) continue;
    usedCountryCodes.add(c.country);
    channels.push({
      id: c.id,
      name: c.name,
      country: c.country,
      categories: c.categories && c.categories.length ? c.categories.slice(0, 3) : ["general"],
      language: langByChannel.get(c.id) ?? null,
      logo: bestLogos.get(c.id) ?? null,
      stream: st.url,
      quality: st.quality,
      is247: st.is247,
    });
  }

  const countryMeta = new Map(raw.countries.map((c) => [c.code, c]));
  const countries: Country[] = [...usedCountryCodes]
    .map((code) => {
      const meta = countryMeta.get(code);
      return { code, name: meta ? meta.name : code, flag: meta?.flag ?? "\u{1F3F4}" };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const usedCats = new Set<string>();
  channels.forEach((ch) => ch.categories.forEach((c) => usedCats.add(c)));
  const catMeta = new Map(raw.categories.map((c) => [c.id, c]));
  const categories: Category[] = [...usedCats]
    .map((id) => {
      const meta = catMeta.get(id);
      return {
        id,
        name: meta ? meta.name : id.charAt(0).toUpperCase() + id.slice(1),
        description: meta?.description ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  channels.sort((a, b) => a.name.localeCompare(b.name));

  return {
    generatedAt,
    source,
    stats: { channels: channels.length, countries: countries.length, categories: categories.length },
    categories,
    countries,
    channels,
  };
}

function readSnapshot(): Dataset {
  const json = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8")) as Dataset;
  if (!json || !Array.isArray(json.channels) || json.channels.length === 0) {
    throw new Error("Invalid bundled snapshot");
  }
  return json;
}

async function fetchJson<T>(name: string): Promise<T> {
  const res = await fetch(`${REMOTE_BASE}/${name}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`iptv-org ${name} -> HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function refreshRemote(): Promise<Dataset | null> {
  try {
    const [channels, streams, categories, countries, feeds, logos, blocklist] = await Promise.all([
      fetchJson<RawData["channels"]>("channels.json"),
      fetchJson<RawData["streams"]>("streams.json"),
      fetchJson<RawData["categories"]>("categories.json"),
      fetchJson<RawData["countries"]>("countries.json"),
      fetchJson<RawData["feeds"]>("feeds.json"),
      fetchJson<RawData["logos"]>("logos.json"),
      fetchJson<RawBlocklistEntry[]>("blocklist.json"),
    ]);
    const dataset = buildDataset(
      { channels, streams, categories, countries, feeds, logos, blocklist },
      new Date().toISOString(),
      "iptv-org/api (live)",
    );
    if (dataset.channels.length === 0) return null;
    return dataset;
  } catch {
    return null;
  }
}

function scheduleRefresh(): void {
  if (!store || store.refreshing) return;
  store.refreshing = true;
  refreshRemote()
    .then((dataset) => {
      if (dataset && store) {
        const counts = buildCounts(dataset.channels);
        store.dataset = dataset;
        store.catCounts = counts.catCounts;
        store.countryCounts = counts.countryCounts;
        store.dataOrigin = "remote";
      }
    })
    .catch(() => undefined)
    .finally(() => {
      if (store) {
        store.refreshing = false;
        store.loadedAt = Date.now(); // avoid tight retry loops; retry after TTL
      }
    });
}

function getStore(): Store {
  if (!store) {
    store = makeStore(readSnapshot(), "snapshot");
    scheduleRefresh(); // opportunistically upgrade to live data in the background
  } else if (Date.now() - store.loadedAt > REMOTE_TTL_MS && !store.refreshing) {
    scheduleRefresh();
  }
  return store;
}

export interface ChannelQuery {
  q?: string;
  country?: string;
  category?: string;
  /** Restrict to one iptv-org language code (e.g. "eng"). Undefined = all languages. */
  language?: string;
  page?: number;
  pageSize?: number;
  sort?: "default" | "name" | "quality";
}

export interface QueryResult {
  items: Channel[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export function queryChannels(query: ChannelQuery): QueryResult {
  const { q, country, category, language, sort = "default" } = query;
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const pageSize = Math.min(120, Math.max(1, Math.floor(query.pageSize ?? 60)));

  const normQ = q ? normalizeText(q) : "";
  let list = getStore().dataset.channels;

  if (language) list = list.filter((c) => c.language === language);
  if (country && country !== "all") list = list.filter((c) => c.country === country);
  if (category && category !== "all") list = list.filter((c) => c.categories.includes(category));

  if (normQ) {
    const scored: Array<{ ch: Channel; score: number }> = [];
    for (const ch of list) {
      const normName = normalizeText(ch.name);
      if (!normName.includes(normQ)) continue;
      const score = normName.startsWith(normQ) ? 2 : 1;
      scored.push({ ch, score });
    }
    list = scored
      .sort(
        (a, b) =>
          b.score - a.score ||
          Number(b.ch.is247) - Number(a.ch.is247) ||
          a.ch.name.localeCompare(b.ch.name),
      )
      .map((s) => s.ch);
  } else if (sort === "name") {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "quality") {
    list = [...list].sort(
      (a, b) => (QUALITY_RANK[b.quality] ?? 1) - (QUALITY_RANK[a.quality] ?? 1) || a.name.localeCompare(b.name),
    );
  } else {
    list = [...list].sort(
      (a, b) => Number(b.is247) - Number(a.is247) || a.name.localeCompare(b.name),
    );
  }

  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize);
  return { items, total, page, pageSize, hasMore: start + pageSize < total };
}

export function getChannelById(id: string): Channel | null {
  return getStore().dataset.channels.find((c) => c.id === id) ?? null;
}

/**
 * Category counts. When a language is provided, counts are recomputed over the
 * language-filtered subset so filter chips always match the visible catalog.
 */
export function getCategoriesWithCounts(language?: string): Array<Category & { count: number }> {
  const { dataset, catCounts } = getStore();
  const counts = language ? countByLanguage(dataset.channels, language, "categories") : catCounts;
  return dataset.categories
    .map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

function countByLanguage(
  channels: Channel[],
  language: string,
  kind: "categories" | "country",
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const ch of channels) {
    if (ch.language !== language) continue;
    if (kind === "country") {
      counts.set(ch.country, (counts.get(ch.country) ?? 0) + 1);
    } else {
      for (const c of ch.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
  }
  return counts;
}

export function getCountriesWithCounts(language?: string): Array<Country & { count: number }> {
  const { dataset, countryCounts } = getStore();
  const counts = language ? countByLanguage(dataset.channels, language, "country") : countryCounts;
  return dataset.countries
    .map((c) => ({ ...c, count: counts.get(c.code) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getMeta(): {
  stats: { channels: number; countries: number; categories: number };
  generatedAt: string;
  source: string;
  dataOrigin: "remote" | "snapshot";
} {
  const { dataset, dataOrigin } = getStore();
  return {
    stats: dataset.stats,
    generatedAt: dataset.generatedAt,
    source: dataset.source,
    dataOrigin,
  };
}
