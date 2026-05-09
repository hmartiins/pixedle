"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Glyph rendered onto the canvas. While playing, this is a placeholder
   * (the real day's emoji never reaches the client until game-over). */
  emoji: string;
  /** 1 (most pixelated) → 6 (sharp). */
  pixelLevel: number;
  /** Output square size, in CSS px. */
  size?: number;
  /** Total pixel buckets (matches MAX_ATTEMPTS on the server). */
  levels?: number;
};

// Block size per level: smaller block = sharper. Index 0 = level 1 (worst).
const BLOCK_BY_LEVEL = [64, 32, 16, 8, 4, 1];

export function PixelCanvas({
  emoji,
  pixelLevel,
  size = 320,
  levels = 6,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Step 1: render the emoji at full resolution onto an off-screen canvas.
    const off = document.createElement("canvas");
    off.width = size;
    off.height = size;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;

    offCtx.fillStyle = "#0f0f1a";
    offCtx.fillRect(0, 0, size, size);
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.font =
      '200px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla","EmojiOne Color",sans-serif';
    offCtx.fillText(emoji, size / 2, size / 2 + 8);

    // Step 2: down-sample to the level's block size, then up-sample with
    // smoothing disabled to produce hard pixel edges.
    const block = BLOCK_BY_LEVEL[Math.min(levels, BLOCK_BY_LEVEL.length) - 1];
    const idx = Math.min(Math.max(pixelLevel, 1), levels) - 1;
    const blockSize =
      idx >= BLOCK_BY_LEVEL.length
        ? BLOCK_BY_LEVEL[BLOCK_BY_LEVEL.length - 1]
        : BLOCK_BY_LEVEL[idx] ?? block;

    const small = document.createElement("canvas");
    const cells = Math.max(1, Math.floor(size / blockSize));
    small.width = cells;
    small.height = cells;
    const smallCtx = small.getContext("2d");
    if (!smallCtx) return;
    smallCtx.imageSmoothingEnabled = true;
    smallCtx.drawImage(off, 0, 0, cells, cells);

    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(small, 0, 0, size, size);
  }, [emoji, pixelLevel, size, levels]);

  return (
    <canvas
      ref={canvasRef}
      className="pixel-canvas pixel-border rounded-sm"
      aria-label="emoji pixelizado do dia"
    />
  );
}
