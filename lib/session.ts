import crypto from "node:crypto";
import { cookies } from "next/headers";
import { MAX_ATTEMPTS } from "./daily";

export type SessionState = {
  date: string; // dailySeed (toDateString)
  attempts: number; // wrong guesses so far
  won: boolean;
  history: string[]; // raw guesses (lowercased) — frontend re-uses these
};

const COOKIE_NAME = "pixedle_session";
const SECRET =
  process.env.PIXEDLE_SECRET ||
  "dev-secret-change-me-in-production-pixedle-cookie-signing-key";

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function encode(state: SessionState): string {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(raw: string | undefined): SessionState | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = sign(payload);
  // timing-safe comparison
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as SessionState;
    if (
      typeof parsed.date !== "string" ||
      typeof parsed.attempts !== "number" ||
      typeof parsed.won !== "boolean" ||
      !Array.isArray(parsed.history)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function emptySession(date: string): SessionState {
  return { date, attempts: 0, won: false, history: [] };
}

export function readSession(today: string): SessionState {
  const raw = cookies().get(COOKIE_NAME)?.value;
  const decoded = decode(raw);
  if (!decoded || decoded.date !== today) {
    return emptySession(today);
  }
  // clamp guard against tampered/old payloads
  if (decoded.attempts < 0 || decoded.attempts > MAX_ATTEMPTS) {
    return emptySession(today);
  }
  return decoded;
}

export function writeSession(state: SessionState): void {
  cookies().set({
    name: COOKIE_NAME,
    value: encode(state),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Expire at the end of "tomorrow" — comfortably covers the daily cycle
    // even when the player crosses midnight mid-session.
    maxAge: 60 * 60 * 36,
  });
}

export function clearSession(): void {
  cookies().delete(COOKIE_NAME);
}
