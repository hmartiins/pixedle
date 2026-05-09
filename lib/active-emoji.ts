import { cookies } from "next/headers";
import { pickDailyEmoji } from "./daily";
import { EMOJIS, type EmojiEntry } from "./emojis";

export const DEV_EMOJI_COOKIE = "dev_emoji";

// In dev, a `dev_emoji` cookie can override the daily pick so you can iterate
// against any emoji without waiting for the seed to roll over. In any other
// environment this falls through to `pickDailyEmoji()` — the cookie is
// ignored even if somehow set.
export function getActiveEmoji(): EmojiEntry {
  if (process.env.NODE_ENV === "development") {
    const value = cookies().get(DEV_EMOJI_COOKIE)?.value;
    if (value) {
      const found = EMOJIS.find((e) => e.emoji === value);
      if (found) return found;
    }
  }
  return pickDailyEmoji();
}
