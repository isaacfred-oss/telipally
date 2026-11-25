/**
 * Generates all PWA icon assets from a hand-crafted SVG mark.
 * Outputs:
 *  - public/icons/icon-192.png, icon-512.png          (any, rounded corners, transparent outside)
 *  - public/icons/maskable-192.png, maskable-512.png  (full-bleed, safe zone)
 *  - public/icons/apple-touch-icon.png (180, full-bleed)
 *  - src/app/icon.png (32 favicon)
 *  - public/logo.svg (header logo)
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const NAVY = "#1a365d";
const NAVY_DEEP = "#12293f";
const TEAL = "#2c7a7b";
const TEAL_BRIGHT = "#38b2ac";

/** TV mark, drawn inside a 512x512 canvas centered in `pad` inset box */
function tvMark(scale = 1, offsetX = 0, offsetY = 0) {
  // base geometry drawn for a 512 box; scaled about center
  const s = (v) => 256 + (v - 256) * scale + offsetX;
  const sw = (v) => v * scale;
  const swAttr = (v) => `stroke-width="${sw(v)}"`;
  return `
  <g>
    <line x1="${s(215)}" y1="${s(120)}" x2="${s(256)}" y2="${s(168)}" stroke="#ffffff" ${swAttr(14)} stroke-linecap="round"/>
    <line x1="${s(297)}" y1="${s(120)}" x2="${s(256)}" y2="${s(168)}" stroke="#ffffff" ${swAttr(14)} stroke-linecap="round"/>
    <circle cx="${s(215)}" cy="${s(112)}" r="${sw(13)}" fill="#ffffff"/>
    <circle cx="${s(297)}" cy="${s(112)}" r="${sw(13)}" fill="#ffffff"/>
    <rect x="${s(118)}" y="${s(168)}" width="${sw(276)}" height="${sw(206)}" rx="${sw(28)}" fill="#ffffff"/>
    <rect x="${s(144)}" y="${s(194)}" width="${sw(184)}" height="${sw(154)}" rx="${sw(18)}" fill="${NAVY_DEEP}"/>
    <path d="M ${s(222)} ${s(236)} L ${s(284)} ${s(271)} L ${s(222)} ${s(306)} Z" fill="${TEAL_BRIGHT}"/>
    <circle cx="${s(360)}" cy="${s(216)}" r="${sw(12)}" fill="${NAVY}"/>
    <circle cx="${s(360)}" cy="${s(250)}" r="${sw(12)}" fill="${NAVY}"/>
    <rect x="${s(342)}" y="${s(296)}" width="${sw(36)}" height="${sw(10)}" rx="${sw(5)}" fill="${NAVY}"/>
    <rect x="${s(158)}" y="${s(374)}" width="${sw(20)}" height="${sw(22)}" rx="${sw(7)}" fill="#ffffff"/>
    <rect x="${s(334)}" y="${s(374)}" width="${sw(20)}" height="${sw(22)}" rx="${sw(7)}" fill="#ffffff"/>
  </g>`;
}

function iconAny(size, radiusPx) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${radiusPx}" fill="${NAVY}"/>
  ${tvMark(0.98)}
</svg>`;
}

function iconMaskable(size) {
  // full-bleed background + mark scaled into ~66% safe zone
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${NAVY}"/>
  ${tvMark(0.66)}
</svg>`;
}

function logoSvg() {
  // transparent background, rounded navy tile + mark; used in header
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${NAVY}"/>
  ${tvMark(0.98)}
</svg>`;
}

async function run() {
  const outDir = "/home/z/my-project/public/icons";
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = [
    ["icon-192.png", iconAny(192, 42), 192],
    ["icon-512.png", iconAny(512, 112), 512],
    ["maskable-192.png", iconMaskable(192), 192],
    ["maskable-512.png", iconMaskable(512), 512],
    ["apple-touch-icon.png", iconMaskable(180), 180],
    ["/home/z/my-project/src/app/icon.png", iconMaskable(32), 32],
  ];

  for (const [name, svg, size] of jobs) {
    const out = name.startsWith("/") ? name : path.join(outDir, name);
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
    console.log("wrote", out, fs.statSync(out).size, "bytes");
  }

  fs.writeFileSync("/home/z/my-project/public/logo.svg", logoSvg());
  console.log("wrote /home/z/my-project/public/logo.svg");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
