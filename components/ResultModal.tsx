"use client";

import { useEffect } from "react";
import type { Stats } from "@/lib/stats";
import { winRate } from "@/lib/stats";

type Props = {
  open: boolean;
  won: boolean;
  revealed: string;
  revealedName: string;
  trivia: string;
  attemptsUsed: number;
  maxAttempts: number;
  stats: Stats;
  onClose: () => void;
  onShare: () => void;
  shareToast?: string | null;
};

export function ResultModal({
  open,
  won,
  revealed,
  revealedName,
  trivia,
  attemptsUsed,
  maxAttempts,
  stats,
  onClose,
  onShare,
  shareToast,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Resultado do dia"
      onClick={onClose}
    >
      <div
        className="pixel-card animate-pop w-full max-w-md p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className={`pixel-text text-center text-base sm:text-lg ${
            won ? "text-pixel" : "text-danger"
          }`}
        >
          {won ? "VOCÊ ACERTOU!" : "QUASE LÁ…"}
        </h2>

        <div className="my-5 flex flex-col items-center gap-2">
          <div className="text-6xl sm:text-7xl">{revealed}</div>
          <div className="text-[10px] uppercase tracking-widest text-neonsoft sm:text-xs">
            {revealedName}
          </div>
        </div>

        <p className="mb-5 text-center text-[10px] leading-relaxed text-soft/85 sm:text-xs">
          {trivia}
        </p>

        <div className="grid grid-cols-4 gap-2 text-center text-[9px] sm:text-[10px]">
          <Stat label="JOGOS" value={String(stats.played)} />
          <Stat label="VITÓRIAS %" value={`${winRate(stats)}`} />
          <Stat label="STREAK" value={String(stats.streak)} />
          <Stat label="MELHOR" value={String(stats.bestStreak)} />
        </div>

        <p className="mt-4 text-center text-[10px] text-soft/70 sm:text-xs">
          Tentativas usadas: {attemptsUsed} / {maxAttempts}
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onShare}
            className="pixel-button pixel-button--accent flex-1 px-3 py-3 text-[10px] sm:text-xs"
          >
            Compartilhar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="pixel-button flex-1 px-3 py-3 text-[10px] sm:text-xs"
          >
            Fechar
          </button>
        </div>

        {shareToast && (
          <p className="mt-3 animate-flash text-center text-[10px] text-pixel">
            {shareToast}
          </p>
        )}

        <p className="mt-4 text-center text-[8px] text-soft/50 sm:text-[10px]">
          Volte amanhã para o próximo emoji.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border-2 border-neon/60 bg-bg/60 px-1 py-2">
      <div className="text-base text-pixel sm:text-lg">{value}</div>
      <div className="mt-1 text-[8px] text-soft/70 sm:text-[9px]">{label}</div>
    </div>
  );
}
