import { NextRequest, NextResponse } from "next/server";
import { dailySeed, matchesEmoji, MAX_ATTEMPTS } from "@/lib/daily";
import { getActiveEmoji } from "@/lib/active-emoji";
import { readSession, writeSession } from "@/lib/session";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getTrivia } from "@/lib/trivia";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limit = rateLimit(getClientIp(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const guess =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { guess?: unknown }).guess === "string"
      ? ((body as { guess: string }).guess as string)
      : null;

  if (!guess || guess.length > 80) {
    return NextResponse.json({ error: "invalid_guess" }, { status: 400 });
  }

  const today = dailySeed();
  const state = readSession(today);

  if (state.won || state.attempts >= MAX_ATTEMPTS) {
    const target = getActiveEmoji();
    return NextResponse.json({
      correct: state.won,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - state.attempts),
      pixelLevel: MAX_ATTEMPTS,
      gameOver: true,
      revealed: state.won ? undefined : target.emoji,
      revealedName: state.won ? undefined : target.name,
      trivia: getTrivia(target.emoji),
      history: state.history,
    });
  }

  const target = getActiveEmoji();
  const correct = matchesEmoji(guess, target);

  if (correct) {
    state.won = true;
    state.history = [...state.history, guess.slice(0, 80)];
    writeSession(state);
    return NextResponse.json({
      correct: true,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - state.attempts),
      pixelLevel: MAX_ATTEMPTS,
      gameOver: true,
      revealed: target.emoji,
      revealedName: target.name,
      trivia: getTrivia(target.emoji),
      history: state.history,
    });
  }

  state.attempts += 1;
  state.history = [...state.history, guess.slice(0, 80)];
  const gameOver = state.attempts >= MAX_ATTEMPTS;
  writeSession(state);

  return NextResponse.json({
    correct: false,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - state.attempts),
    // pixelLevel ramps up only as long as the player still has tries left
    pixelLevel: Math.min(MAX_ATTEMPTS, state.attempts + 1),
    gameOver,
    revealed: gameOver ? target.emoji : undefined,
    revealedName: gameOver ? target.name : undefined,
    trivia: gameOver ? getTrivia(target.emoji) : undefined,
    history: state.history,
  });
}
