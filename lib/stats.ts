// localStorage helpers for streak/win-rate tracking. The authoritative
// session state lives server-side; this is purely cosmetic and is keyed
// by toDateString so a player can't double-count the same day.

export type Stats = {
  played: number;
  wins: number;
  streak: number;
  bestStreak: number;
  lastPlayed: string | null; // toDateString of the last day a result was recorded
  lastResult: "win" | "loss" | null;
  attemptsUsed: number | null;
};

const KEY = "pixedle:stats:v1";

const EMPTY: Stats = {
  played: 0,
  wins: 0,
  streak: 0,
  bestStreak: 0,
  lastPlayed: null,
  lastResult: null,
  attemptsUsed: null,
};

export function loadStats(): Stats {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function save(stats: Stats) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    /* quota — ignore */
  }
}

function isYesterday(prev: string, today: string): boolean {
  const prevTime = new Date(prev).getTime();
  const todayTime = new Date(today).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  // toDateString strips time, so the diff between consecutive days is exactly
  // 24h regardless of DST (which only happens at 2am on edge days).
  return Math.round((todayTime - prevTime) / oneDay) === 1;
}

export function recordResult(
  result: "win" | "loss",
  attemptsUsed: number,
): Stats {
  const today = new Date().toDateString();
  const current = loadStats();
  if (current.lastPlayed === today) {
    // Already recorded today — keep stats idempotent across page reloads.
    return current;
  }

  const continuing =
    result === "win" &&
    current.lastResult === "win" &&
    current.lastPlayed &&
    isYesterday(current.lastPlayed, today);

  const streak = result === "win" ? (continuing ? current.streak + 1 : 1) : 0;

  const next: Stats = {
    played: current.played + 1,
    wins: current.wins + (result === "win" ? 1 : 0),
    streak,
    bestStreak: Math.max(current.bestStreak, streak),
    lastPlayed: today,
    lastResult: result,
    attemptsUsed,
  };
  save(next);
  return next;
}

export function winRate(stats: Stats): number {
  if (stats.played === 0) return 0;
  return Math.round((stats.wins / stats.played) * 100);
}
