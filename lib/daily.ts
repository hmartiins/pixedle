import { EMOJIS, EmojiEntry } from "./emojis";

export const MAX_ATTEMPTS = 6;
// pixelLevel meaning: 1 = blockiest (worst), 6 = sharp.
// Player starts at level 1; each wrong guess increments by 1 up to MAX_ATTEMPTS.
export const PIXEL_LEVELS = MAX_ATTEMPTS;

// djb2 hash — small, deterministic, no crypto needed for a public seed.
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0; // unsigned 32-bit
}

export function dailySeed(date: Date = new Date()): string {
  return date.toDateString();
}

export function pickDailyEmoji(date: Date = new Date()): EmojiEntry {
  const seed = dailySeed(date);
  const idx = djb2(seed) % EMOJIS.length;
  return EMOJIS[idx];
}

// Loose normalization for guess matching: lowercase, strip diacritics,
// drop punctuation, collapse whitespace.
export function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{Emoji}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesEmoji(guess: string, target: EmojiEntry): boolean {
  const g = normalize(guess);
  if (!g) return false;
  if (guess.includes(target.emoji)) return true;
  if (g === normalize(target.name)) return true;
  for (const alias of target.aliases ?? []) {
    if (g === normalize(alias)) return true;
  }
  return false;
}
