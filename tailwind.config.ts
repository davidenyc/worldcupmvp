import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        "ink-55": "var(--ink-55)",
        "ink-45": "var(--ink-45)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        bg: "var(--bg)",
        border: "var(--border)",
        gold: "var(--gold)",
        field: "#f7fafc",
        surfaceHigh: "#eef4ff",
        accent: "#f4b942",
        red: "#e63946",
        cloud: "#ffffff",
        card: "#ffffff",
        muted: "rgba(10,22,40,0.55)",
        subtle: "rgba(10,22,40,0.25)",
        navy: "var(--ink)",
        deep: "var(--ink)",
        sky: "var(--surface-3)",
        mist: "var(--ink-55)",
        line: "var(--border-2)"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(10,22,40,0.12)",
        card: "0 8px 32px rgba(10,22,40,0.08)",
        gold: "0 4px 20px rgba(244,185,66,0.25)"
      }
    }
  },
  plugins: []
};

export default config;
