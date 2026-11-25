/**
 * Builds src/data/telipally-snapshot.json from raw iptv-org API dumps.
 * Selection rules:
 *  - Only channels that have at least one usable browser stream:
 *      https:// URL, no user-agent, no referrer required (these break in <video>)
 *  - Non-NSFW only
 *  - Must belong to a country
 *  - Logo: prefer in_use + PNG + width >= 120
 *  - Language: from main feed languages (first)
 */
const fs = require("fs");

const DIR = "/tmp/iptv";
const OUT = "/home/z/my-project/src/data/telipally-snapshot.json";

const channels = JSON.parse(fs.readFileSync(`${DIR}/channels.json`, "utf8"));
const streams = JSON.parse(fs.readFileSync(`${DIR}/streams.json`, "utf8"));
const categories = JSON.parse(fs.readFileSync(`${DIR}/categories.json`, "utf8"));
const countries = JSON.parse(fs.readFileSync(`${DIR}/countries.json`, "utf8"));
const feeds = JSON.parse(fs.readFileSync(`${DIR}/feeds.json`, "utf8"));
const logos = JSON.parse(fs.readFileSync(`${DIR}/logos.json`, "utf8"));

const QUALITY_RANK = { "1080p": 6, "720p": 5, "480p": 4, "360p": 3, "240p": 2 };

// --- best stream per channel ---
const bestStreams = new Map();
for (const s of streams) {
  if (!s.channel || !s.url) continue;
  if (!/^https:\/\//i.test(s.url)) continue; // https only (mixed-content safe)
  if (s.user_agent || s.referrer) continue; // needs special headers -> unusable in browser
  const score =
    (QUALITY_RANK[s.quality] ?? 1) * 100 +
    (s.labels && s.labels.includes("Not 24/7") ? 0 : 50) +
    (/playlist\.m3u8$|\.m3u8($|\?)/i.test(s.url) ? 20 : 0);
  const prev = bestStreams.get(s.channel);
  if (!prev || prev.score < score) {
    bestStreams.set(s.channel, {
      score,
      url: s.url,
      quality: s.quality || "auto",
      is247: !(s.labels || []).includes("Not 24/7"),
    });
  }
}

// --- logo per channel (prefer in_use PNG, reasonable width) ---
const bestLogos = new Map();
for (const l of logos) {
  if (!l.channel || !l.url) continue;
  let score = 0;
  if (l.in_use) score += 40;
  if ((l.format || "").toUpperCase() === "PNG") score += 30;
  if ((l.width || 0) >= 120) score += 20;
  if ((l.width || 0) >= 200) score += 10;
  const prev = bestLogos.get(l.channel);
  if (!prev || prev.score < score) bestLogos.set(l.channel, { score, url: l.url });
}

// --- language from any feed ---
const langByChannel = new Map();
for (const f of feeds) {
  if (!f.channel || !f.languages || !f.languages.length) continue;
  if (!langByChannel.has(f.channel) || (f.is_main && !langByChannel.get(f.channel))) {
    langByChannel.set(f.channel, f.languages[0]);
  }
}

const usedCountryCodes = new Set();
const outChannels = [];
for (const c of channels) {
  if (!c.country || c.is_nsfw) continue;
  const st = bestStreams.get(c.id);
  if (!st) continue;
  usedCountryCodes.add(c.country);
  outChannels.push({
    id: c.id,
    name: c.name,
    country: c.country,
    categories: c.categories && c.categories.length ? c.categories.slice(0, 3) : ["general"],
    language: langByChannel.get(c.id) || null,
    logo: bestLogos.get(c.id)?.url || null,
    stream: st.url,
    quality: st.quality,
    is247: st.is247,
  });
}

// --- countries actually used ---
const countryMeta = new Map(countries.map((c) => [c.code, c]));
const outCountries = [...usedCountryCodes]
  .map((code) => {
    const meta = countryMeta.get(code);
    return {
      code,
      name: meta ? meta.name : code,
      flag: meta ? meta.flag : "\u{1F3F4}",
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// --- categories used ---
const usedCats = new Set();
outChannels.forEach((ch) => ch.categories.forEach((c) => usedCats.add(c)));
const catMeta = new Map(categories.map((c) => [c.id, c]));
const outCategories = [...usedCats]
  .map((id) => ({
    id,
    name: catMeta.get(id) ? catMeta.get(id).name : id.charAt(0).toUpperCase() + id.slice(1),
    description: catMeta.get(id)?.description || null,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

outChannels.sort((a, b) => a.name.localeCompare(b.name));

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: "iptv-org/api (https://github.com/iptv-org/iptv)",
  stats: {
    channels: outChannels.length,
    countries: outCountries.length,
    categories: outCategories.length,
  },
  categories: outCategories,
  countries: outCountries,
  channels: outChannels,
};

fs.mkdirSync("/home/z/my-project/src/data", { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(snapshot));

console.log("channels:", outChannels.length);
console.log("countries:", outCountries.length);
console.log("categories:", outCategories.length);
console.log("size MB:", (fs.statSync(OUT).size / 1024 / 1024).toFixed(2));
