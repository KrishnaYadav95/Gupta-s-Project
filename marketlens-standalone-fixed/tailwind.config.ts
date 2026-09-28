import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        display: ["'Inter'", "sans-serif"],
      },
      colors: {
        bg: {
          base: "#0a0a0f",
          surface: "#111118",
          elevated: "#1a1a24",
          border: "#2a2a3a",
        },
        accent: {
          DEFAULT: "#00d4aa",
          dim: "#00a888",
          glow: "rgba(0,212,170,0.15)",
        },
        bull: "#00d4aa",
        bear: "#ff4d6a",
        neutral: "#8888aa",
      },
    },
  },
  plugins: [],
};

export default config;
