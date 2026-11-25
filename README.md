# TeliPally

A free, installable **Progressive Web App (PWA)** for browsing and streaming thousands of live TV
channels from around the world — organized by country and category, powered by the open-source
[iptv-org](https://github.com/iptv-org/iptv) channel directory.

![TeliPally](public/icons/icon-512.png)

## Features

- **Browse 8,400+ live channels** from 180 countries across 29 categories
- **Watch instantly** — HLS player (`hls.js`) with native HLS fallback, autoplay handling,
  retry states and buffering indicators
- **Search** the whole directory by channel name (normalized, diacritic-insensitive)
- **Filter** by category chips and country (with live channel counts)
- **Favorites** — persist locally per device (no account required)
- **Continue watching** — recent channels row
- **Installable PWA** — web app manifest, custom service worker (offline app shell),
  install prompt handling, iOS "Add to Home Screen" guidance
- **Dark mode** (system-aware), responsive layout with mobile bottom navigation
- **Live data refresh** — boots from a bundled snapshot of the iptv-org directory and
  refreshes from the live API in the background every 12 hours (stale-while-revalidate)

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | Tailwind CSS 4 + shadcn/ui + Lucide icons |
| Video | hls.js |
| Client state | Zustand (persisted favorites / recents / settings) |
| Server data | TanStack Query |
| Data source | iptv-org API + bundled snapshot fallback |
| Hosting | Vercel |

## Architecture notes

- `src/lib/iptv/store.ts` — server-only channel store: loads `src/data/telipally-snapshot.json`
  (a curated snapshot: https-only, browser-playable streams), then opportunistically refreshes
  from `iptv-org.github.io/api` in the background. Streams requiring special headers or
  user-agents, http-only and NSFW channels are filtered out.
- `public/sw.js` — service worker: cache-first for static assets, network-first with cache
  fallback for navigations and API responses (the app keeps working offline with last-seen data).
- `scripts/build-snapshot.cjs` — rebuilds the bundled snapshot from raw iptv-org dumps.
- `scripts/build-icons.cjs` — regenerates all PWA icons from a single SVG mark.

## API routes

| Endpoint | Description |
|---|---|
| `GET /api/channels` | Filtered/paginated channel list (`q`, `country`, `category`, `page`, `pageSize`, `sort`) |
| `GET /api/channels/[id]` | Single channel with stream URL |
| `GET /api/categories` | Categories with channel counts |
| `GET /api/countries` | Countries with channel counts |
| `GET /api/meta` | Directory stats + data freshness |

## Getting started

```bash
bun install
bun run dev        # http://localhost:3000
bun run lint       # ESLint
```

No environment variables are required.

## Deploy

The repo deploys to Vercel zero-config (Next.js is auto-detected; `vercel.json` pins the build
command so the PWA icon PNGs are regenerated from `public/logo.svg` at build time via
`scripts/build-icons.cjs`). The bundled snapshot ships with the serverless functions via
`outputFileTracingIncludes`, so channel data is available even before the first background
refresh completes.

**Install the PWA:** open the deployed site in Chrome/Edge (desktop or Android) and use the
"Install app" button, or on iOS: Share → Add to Home Screen.

## Credits

Channel data and streams: the [iptv-org](https://github.com/iptv-org/iptv) community project.
TeliPally is a discovery layer for that public directory — it hosts no content itself.

## License

MIT for the TeliPally app code. Channel data follows the iptv-org project licensing.
