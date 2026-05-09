import { NextRequest, NextResponse } from "next/server";
import { dailySeed, MAX_ATTEMPTS, pickDailyEmoji } from "@/lib/daily";
import { renderPixelatedEmoji } from "@/lib/emoji-image";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { readSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = rateLimit(getClientIp(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const today = dailySeed();
  const state = readSession(today);
  const target = pickDailyEmoji();

  // The level the player has *earned* — never trust a query param for this.
  // Won and game-over states get the sharp render; otherwise it's
  // attempts+1, capped at MAX.
  const level =
    state.won || state.attempts >= MAX_ATTEMPTS
      ? MAX_ATTEMPTS
      : Math.min(MAX_ATTEMPTS, state.attempts + 1);

  try {
    const png = await renderPixelatedEmoji(target.emoji, level);
    return new NextResponse(png, {
      status: 200,
      headers: {
        "content-type": "image/png",
        // Per-level cache; client busts via a query string on level change.
        "cache-control": "private, max-age=60",
        "x-pixel-level": String(level),
      },
    });
  } catch {
    return NextResponse.json({ error: "render_failed" }, { status: 502 });
  }
}
