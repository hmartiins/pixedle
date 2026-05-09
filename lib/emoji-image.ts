import sharp from "sharp";

// Server-only emoji rasterizer.
// Source PNGs come from the Twemoji SVG/PNG mirror on jsDelivr — stable
// codepoint-keyed URLs. We download once per emoji, cache in-memory, then
// pixelate per requested level. The codepoint and the rendered emoji never
// reach the client in any form besides the pre-pixelated bitmap.

const TWEMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72";

// 320 lines up with the previous client-side canvas size; large enough to
// look crisp on retina, small enough that each pixelation pass stays cheap.
const RENDER_SIZE = 320;

// Block size per pixelLevel (1 = blockiest, 6 = sharp). Same progression the
// player saw before, just executed server-side.
const BLOCK_BY_LEVEL = [64, 32, 16, 8, 4, 1];

const sourceCache = new Map<string, Buffer>();
const renderedCache = new Map<string, Buffer>();
// Bound the rendered cache so we don't grow it unbounded across days.
const MAX_RENDERED_ENTRIES = 64;

// Mirror Twemoji's `grabTheRightIcon` rule: drop the FE0F variation selector
// unless it precedes a keycap (U+20E3). Without this, emojis like ❤️ resolve
// to "2764-fe0f", which 404s — they're stored as just "2764".
function emojiToCodePoints(emoji: string): string {
  const cps: number[] = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined) cps.push(cp);
  }
  const filtered = cps.filter((cp, i) => {
    if (cp === 0xfe0f) return cps[i + 1] === 0x20e3;
    return true;
  });
  return filtered.map((cp) => cp.toString(16)).join("-");
}

async function fetchSource(emoji: string): Promise<Buffer> {
  const key = emojiToCodePoints(emoji);
  const cached = sourceCache.get(key);
  if (cached) return cached;

  const url = `${TWEMOJI_BASE}/${key}.png`;
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`twemoji_fetch_failed:${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  sourceCache.set(key, buf);
  return buf;
}

function blockSizeFor(level: number): number {
  const idx = Math.min(Math.max(level, 1), BLOCK_BY_LEVEL.length) - 1;
  return BLOCK_BY_LEVEL[idx]!;
}

async function pixelate(src: Buffer, level: number): Promise<Buffer> {
  const block = blockSizeFor(level);
  if (block <= 1) {
    // Sharp result — high-quality upscale, no downsampling step.
    return sharp(src)
      .resize(RENDER_SIZE, RENDER_SIZE, { kernel: "lanczos3" })
      .flatten({ background: { r: 15, g: 15, b: 26 } })
      .png()
      .toBuffer();
  }
  const cells = Math.max(1, Math.floor(RENDER_SIZE / block));
  // Sharp coalesces successive .resize() calls in a single pipeline — the
  // last one wins, which silently drops our pixelization step. We force two
  // passes by materializing the intermediate buffer between them.
  const small = await sharp(src)
    .resize(cells, cells, { kernel: "lanczos3" })
    .png()
    .toBuffer();
  return sharp(small)
    .resize(RENDER_SIZE, RENDER_SIZE, { kernel: "nearest" })
    .flatten({ background: { r: 15, g: 15, b: 26 } })
    .png()
    .toBuffer();
}

/** Render the day's emoji at the given pixel level (1..6). */
export async function renderPixelatedEmoji(
  emoji: string,
  level: number,
): Promise<Buffer> {
  const cpKey = emojiToCodePoints(emoji);
  const cacheKey = `${cpKey}:${level}`;
  const cached = renderedCache.get(cacheKey);
  if (cached) return cached;

  const src = await fetchSource(emoji);
  const out = await pixelate(src, level);

  if (renderedCache.size >= MAX_RENDERED_ENTRIES) {
    // Cheapest eviction: clear oldest insertion.
    const firstKey = renderedCache.keys().next().value;
    if (firstKey) renderedCache.delete(firstKey);
  }
  renderedCache.set(cacheKey, out);
  return out;
}
