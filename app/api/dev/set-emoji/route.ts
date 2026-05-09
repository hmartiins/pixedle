import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEV_EMOJI_COOKIE } from "@/lib/active-emoji";
import { clearSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "not_available" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const emoji =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { emoji?: unknown }).emoji === "string"
      ? (body as { emoji: string }).emoji
      : null;

  // Always wipe the daily session so the player restarts at level 1 with
  // fresh attempts — otherwise the new emoji would inherit the previous
  // pixel level and history.
  clearSession();

  const jar = cookies();
  if (emoji && emoji.length <= 16) {
    jar.set({
      name: DEV_EMOJI_COOKIE,
      value: emoji,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } else {
    jar.delete(DEV_EMOJI_COOKIE);
  }

  return NextResponse.json({ ok: true });
}
