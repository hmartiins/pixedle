// Tiny Web Audio synth — no audio assets, no autoplay surprises.
// Calls become no-ops on the server or before the user has interacted.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Cls =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Cls) return null;
    ctx = new Cls();
  }
  return ctx;
}

function beep(
  freq: number,
  durationMs: number,
  type: OscillatorType = "square",
  gain = 0.08,
) {
  const ac = getCtx();
  if (!ac) return;
  // Browsers suspend the context until a user gesture; resume() is cheap if
  // already running and harmless if blocked.
  ac.resume().catch(() => {});

  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + durationMs / 1000,
  );
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + durationMs / 1000);
}

export function playWrong() {
  beep(180, 220, "sawtooth", 0.06);
}

export function playRight() {
  // little arpeggio
  beep(523, 120, "square", 0.07);
  setTimeout(() => beep(659, 120, "square", 0.07), 110);
  setTimeout(() => beep(784, 220, "square", 0.08), 220);
}

export function playLose() {
  beep(220, 200, "sawtooth", 0.06);
  setTimeout(() => beep(165, 320, "sawtooth", 0.06), 180);
}
