"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DevEmojiPicker } from "@/components/DevEmojiPicker";
import { GuessInput, type SuggestionItem } from "@/components/GuessInput";
import { Hearts } from "@/components/Hearts";
import { PixelCanvas } from "@/components/PixelCanvas";
import { ResultModal } from "@/components/ResultModal";
import { playLose, playRight, playWrong } from "@/lib/sounds";
import { loadStats, recordResult, type Stats } from "@/lib/stats";

const MAX_ATTEMPTS = 6;

type DailyInfo = {
  pixelLevel: number;
  attemptsLeft: number;
  alreadyWon: boolean;
  gameOver: boolean;
  history: string[];
  maxAttempts: number;
};

type GuessResponse = {
  correct: boolean;
  attemptsLeft: number;
  pixelLevel: number;
  gameOver: boolean;
  revealed?: string;
  revealedName?: string;
  trivia?: string;
  history: string[];
};

type RevealedState = {
  emoji: string;
  name: string;
  trivia: string;
};

export default function Home() {
  const [pixelLevel, setPixelLevel] = useState(1);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [history, setHistory] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState<RevealedState | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [stats, setStats] = useState<Stats>(() => loadStats());
  const [modalOpen, setModalOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guard so we only record stats once per day even after rerenders.
  const recordedRef = useRef(false);

  const finishGame = useCallback(
    (result: "win" | "loss", attemptsUsed: number) => {
      if (recordedRef.current) return;
      recordedRef.current = true;
      const next = recordResult(result, attemptsUsed);
      setStats(next);
    },
    [],
  );

  // Bootstrap: pull current daily state and the autocomplete catalog.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [infoRes, listRes] = await Promise.all([
          fetch("/api/daily-info", { cache: "no-store" }),
          fetch("/api/emoji-list"),
        ]);
        if (!infoRes.ok || !listRes.ok) {
          throw new Error("network");
        }
        const info = (await infoRes.json()) as DailyInfo;
        const list = (await listRes.json()) as { emojis: SuggestionItem[] };
        if (cancelled) return;

        setPixelLevel(info.pixelLevel);
        setAttemptsLeft(info.attemptsLeft);
        setHistory(info.history);
        setWon(info.alreadyWon);
        setGameOver(info.gameOver);
        setSuggestions(list.emojis);

        if (info.gameOver) {
          // Server only reveals on POST /api/guess once game-over; if we land
          // mid-day on a finished state, ping it once to fetch the reveal.
          const revealRes = await fetch("/api/guess", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ guess: "_" }),
          });
          if (revealRes.ok) {
            const data = (await revealRes.json()) as GuessResponse;
            if (data.revealed && data.revealedName && data.trivia) {
              setRevealed({
                emoji: data.revealed,
                name: data.revealedName,
                trivia: data.trivia,
              });
              if (info.alreadyWon) {
                finishGame("win", MAX_ATTEMPTS - info.attemptsLeft + 1);
              } else {
                finishGame("loss", MAX_ATTEMPTS);
              }
              setModalOpen(true);
            }
          }
        }
      } catch {
        if (!cancelled)
          setError("Não consegui carregar o jogo. Tente recarregar a página.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [finishGame]);

  const handleGuess = useCallback(
    async (raw: string) => {
      if (pending || gameOver) return;
      setPending(true);
      setError(null);
      try {
        const res = await fetch("/api/guess", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ guess: raw }),
        });
        if (res.status === 429) {
          setError("Muitas tentativas — espere um instante.");
          return;
        }
        if (!res.ok) {
          setError("Não consegui enviar sua tentativa.");
          return;
        }
        const data = (await res.json()) as GuessResponse;
        setAttemptsLeft(data.attemptsLeft);
        setPixelLevel(data.pixelLevel);
        setHistory(data.history);

        if (data.correct) {
          setWon(true);
          setGameOver(true);
          if (data.revealed && data.revealedName && data.trivia) {
            setRevealed({
              emoji: data.revealed,
              name: data.revealedName,
              trivia: data.trivia,
            });
          }
          finishGame("win", MAX_ATTEMPTS - data.attemptsLeft + 1);
          playRight();
          // Slight delay so the player sees the sharp emoji before the modal.
          setTimeout(() => setModalOpen(true), 700);
          return;
        }

        if (data.gameOver) {
          setGameOver(true);
          if (data.revealed && data.revealedName && data.trivia) {
            setRevealed({
              emoji: data.revealed,
              name: data.revealedName,
              trivia: data.trivia,
            });
          }
          finishGame("loss", MAX_ATTEMPTS);
          playLose();
          setTimeout(() => setModalOpen(true), 600);
          return;
        }

        playWrong();
        setShake(true);
        setTimeout(() => setShake(false), 420);
      } finally {
        setPending(false);
      }
    },
    [pending, gameOver, finishGame],
  );

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  }, []);

  const onCopy = useCallback(async () => {
    if (!revealed) return;
    const attempts = won ? MAX_ATTEMPTS - attemptsLeft + 1 : MAX_ATTEMPTS;
    const grid = Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
      if (i < (won ? attempts - 1 : MAX_ATTEMPTS)) return "🟪";
      if (i === attempts - 1 && won) return "🟩";
      return "⬛";
    }).join("");
    const lines = [
      `Pixedle — ${todayLabel}`,
      won
        ? `Acertei em ${attempts}/${MAX_ATTEMPTS}`
        : `Não acertei (${MAX_ATTEMPTS}/${MAX_ATTEMPTS})`,
      grid,
      window.location.href,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      setCopyToast("Copiado para a área de transferência!");
    } catch {
      setCopyToast("Não consegui copiar.");
    }
    setTimeout(() => setCopyToast(null), 2200);
  }, [revealed, won, attemptsLeft, todayLabel]);

  const attemptsUsed = MAX_ATTEMPTS - attemptsLeft + (won ? 1 : 0);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-4 py-6 sm:py-10">
      <header className="mb-6 w-full text-center">
        <h1 className="pixel-text text-2xl text-neonsoft sm:text-4xl">
          PIXEDLE
        </h1>
        <p className="mt-2 text-[9px] text-soft/70 sm:text-[11px]">
          adivinhe o emoji do dia <br /> {todayLabel}
        </p>
      </header>

      <section
        className={`flex flex-col items-center gap-5 ${shake ? "animate-shake" : ""}`}
      >
        <PixelCanvas pixelLevel={pixelLevel} />

        <Hearts total={MAX_ATTEMPTS} remaining={attemptsLeft} />
      </section>

      <section className="mt-6 w-full">
        <GuessInput
          suggestions={suggestions}
          disabled={pending || gameOver}
          onSubmit={handleGuess}
        />
        {error && (
          <p className="mt-2 text-center text-[10px] text-danger">{error}</p>
        )}
      </section>

      {history.length > 0 && (
        <section className="mt-6 w-full">
          <h2 className="mb-2 text-center text-[9px] uppercase tracking-widest text-neonsoft sm:text-[11px]">
            Tentativas
          </h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {history.map((entry, i) => {
              const isLastWin = won && i === history.length - 1;
              return (
                <li
                  key={`${entry}-${i}`}
                  className={`rounded-sm border-2 px-2 py-1 text-[10px] sm:text-xs ${
                    isLastWin
                      ? "border-pixel bg-pixel/20 text-pixel"
                      : "border-neon/60 bg-bgsoft text-soft/80"
                  }`}
                >
                  {entry}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {gameOver && !modalOpen && revealed && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="pixel-button pixel-button--accent mt-6 px-4 py-3 text-[10px] sm:text-xs"
        >
          Ver resultado
        </button>
      )}

      <footer className="mt-auto pt-8 text-center text-[8px] text-soft/40 sm:text-[10px]">
        novo desafio toda meia-noite
      </footer>

      {revealed && (
        <ResultModal
          open={modalOpen}
          won={won}
          revealed={revealed.emoji}
          revealedName={revealed.name}
          trivia={revealed.trivia}
          attemptsUsed={won ? attemptsUsed : MAX_ATTEMPTS}
          maxAttempts={MAX_ATTEMPTS}
          stats={stats}
          onClose={() => setModalOpen(false)}
          onCopy={onCopy}
          copyToast={copyToast}
        />
      )}

      {process.env.NODE_ENV === "development" && <DevEmojiPicker />}
    </main>
  );
}
