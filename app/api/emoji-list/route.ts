import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_EMOJI_LIST } from "@/lib/emojis";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-static";

export async function GET(req: NextRequest) {
  const limit = rateLimit(getClientIp(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  return NextResponse.json({ emojis: PUBLIC_EMOJI_LIST });
}
