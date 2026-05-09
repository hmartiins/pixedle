"use client";

import { useEffect, useState } from "react";

type Props = {
  /** 1 (most pixelated) → 6 (sharp). Used purely as a cache-buster on the
   * src URL — the real pixel level is enforced server-side from the cookie. */
  pixelLevel: number;
  /** Output square size, in CSS px. */
  size?: number;
};

// The image is rendered server-side from the day's emoji. The codepoint is
// never sent to this component — we just point at /api/emoji-image and let
// the cookie-bound pixel level decide what comes back.
export function PixelCanvas({ pixelLevel, size = 320 }: Props) {
  const [src, setSrc] = useState(`/api/emoji-image?v=${pixelLevel}`);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setSrc(`/api/emoji-image?v=${pixelLevel}&t=${Date.now()}`);
  }, [pixelLevel]);

  return (
    <div
      className="pixel-border rounded-sm"
      style={{ width: size, height: size, background: "#0f0f1a" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="emoji pixelizado do dia"
        width={size}
        height={size}
        onLoad={() => setLoaded(true)}
        className="pixel-canvas block h-full w-full"
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 220ms ease, filter 450ms ease",
        }}
      />
    </div>
  );
}
