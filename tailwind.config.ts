import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f1a",
        bgsoft: "#161629",
        neon: "#7c3aed",
        neonsoft: "#a78bfa",
        pixel: "#facc15",
        soft: "#f5f5f5",
        danger: "#ef4444",
        good: "#22c55e",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0 0 rgba(0,0,0,0.6)",
        neon: "0 0 18px rgba(124,58,237,0.55)",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        pop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        flash: {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        pop: "pop 0.25s ease-out",
        flash: "flash 0.5s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
