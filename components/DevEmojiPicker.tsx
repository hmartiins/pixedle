"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SuggestionItem } from "./GuessInput";

type Props = {
  emojis: SuggestionItem[];
};

const DEV_COOKIE = "dev_emoji";

function readDevCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${DEV_COOKIE}=`));
  if (!match) return null;
  const value = match.slice(DEV_COOKIE.length + 1);
  try {
    return decodeURIComponent(value) || null;
  } catch {
    return value || null;
  }
}

export function DevEmojiPicker({ emojis }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActive(readDevCookie());
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return emojis;
    return emojis.filter(
      (e) => e.name.toLowerCase().includes(q) || e.emoji.includes(q),
    );
  }, [emojis, query]);

  async function setDevEmoji(emoji: string | null) {
    setPending(true);
    try {
      const res = await fetch("/api/dev/set-emoji", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) return;
      // Hard reload — every server route reads cookies during render, and
      // the daily-info bootstrap on the client needs a fresh fetch anyway.
      window.location.reload();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-md border border-neon/60 bg-bgsoft/95 px-3 py-2 text-soft shadow-pixel backdrop-blur"
          title="Trocar emoji (modo dev)"
        >
          <span className="text-base">🛠️</span>
          <span className="text-[10px] uppercase tracking-widest text-neonsoft">
            dev
          </span>
          {active && <span className="text-base leading-none">{active}</span>}
        </button>
      )}

      {open && (
        <div className="flex w-72 flex-col gap-2 rounded-md border border-neon/60 bg-bgsoft/95 p-3 shadow-pixel backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-neonsoft">
              dev emoji
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[10px] text-soft/60 hover:text-soft"
            >
              fechar
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-soft/70">
            <span>atual:</span>
            <span className="text-base">{active ?? "🎲 (do dia)"}</span>
            {active && (
              <button
                type="button"
                disabled={pending}
                onClick={() => setDevEmoji(null)}
                className="ml-auto rounded border border-soft/30 px-2 py-0.5 text-[9px] text-soft/80 hover:bg-soft/10 disabled:opacity-50"
              >
                limpar
              </button>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="buscar por nome…"
            className="rounded border border-neon/40 bg-bg/80 px-2 py-1 text-soft placeholder:text-soft/40 focus:border-neon focus:outline-none"
          />

          <div className="grid max-h-64 grid-cols-8 gap-1 overflow-y-auto">
            {filtered.map((e) => (
              <button
                key={e.emoji}
                type="button"
                disabled={pending}
                onClick={() => setDevEmoji(e.emoji)}
                title={e.name}
                className={`flex h-8 w-8 items-center justify-center rounded text-lg leading-none transition hover:bg-neon/30 disabled:opacity-50 ${
                  active === e.emoji ? "bg-pixel/30 ring-1 ring-pixel" : ""
                }`}
              >
                {e.emoji}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-8 py-4 text-center text-[10px] text-soft/50">
                nenhum emoji encontrado
              </p>
            )}
          </div>

          <p className="text-[9px] text-soft/40">
            trocar reseta a sessão (tentativas e pixel level).
          </p>
        </div>
      )}
    </div>
  );
}
