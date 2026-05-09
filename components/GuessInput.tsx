"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SuggestionItem = { emoji: string; name: string };

type Props = {
  suggestions: SuggestionItem[];
  disabled: boolean;
  onSubmit: (guess: string) => void;
};

function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

const MAX_VISIBLE = 8;

export function GuessInput({ suggestions, disabled, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = normalize(value);
    if (!q) return [];
    return suggestions
      .filter(
        (s) =>
          normalize(s.name).includes(q) ||
          s.emoji === value ||
          s.emoji.includes(q),
      )
      .slice(0, MAX_VISIBLE);
  }, [value, suggestions]);

  useEffect(() => {
    setHighlight(0);
  }, [matches.length]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function commit(guess: string) {
    const trimmed = guess.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
    setFocused(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(matches.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = matches[highlight];
      if (pick) commit(pick.name);
      else commit(value);
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  }

  const showList = focused && matches.length > 0;

  return (
    <div ref={wrapRef} className="flex w-full flex-col gap-2">
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder="Digite o nome ou um emoji…"
          aria-label="Sua tentativa"
          autoComplete="off"
          spellCheck={false}
          className="pixel-input w-full px-3 py-3 text-xs sm:text-sm"
          maxLength={80}
        />
        {showList && (
          <ul
            className="suggestion-list absolute left-0 right-0 top-full z-10 text-xs sm:text-sm"
            role="listbox"
          >
            {matches.map((m, i) => (
              <li
                key={`${m.emoji}-${m.name}`}
                role="option"
                aria-selected={i === highlight}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(m.name);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                  i === highlight ? "bg-neon/40" : ""
                }`}
              >
                <span className="text-2xl leading-none">{m.emoji}</span>
                <span className="truncate">{m.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        onClick={() => commit(value)}
        disabled={disabled || !value.trim()}
        className="pixel-button w-full px-4 py-3 text-xs sm:text-sm"
      >
        Chutar
      </button>
    </div>
  );
}
