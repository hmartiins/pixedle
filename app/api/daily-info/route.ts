import { NextRequest, NextResponse } from "next/server";
import { dailySeed, MAX_ATTEMPTS } from "@/lib/daily";
import { readSession, writeSession } from "@/lib/session";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

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
  // touch the cookie so a fresh visitor gets one without exposing anything
  writeSession(state);

  const pixelLevel = state.won ? MAX_ATTEMPTS : state.attempts + 1;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - state.attempts);

  return NextResponse.json({
    pixelLevel,
    attemptsLeft,
    alreadyWon: state.won,
    gameOver: state.won || state.attempts >= MAX_ATTEMPTS,
    history: state.history,
    maxAttempts: MAX_ATTEMPTS,
  });
}
