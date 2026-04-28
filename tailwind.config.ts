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
      fontSize: {
        display: ["3.5rem", { lineHeight: "1", letterSpacing: "-0.094rem", fontWeight: "700" }],
        h1: ["2rem", { lineHeight: "2.375rem", letterSpacing: "-0.031rem", fontWeight: "600" }],
        h2: ["1.5rem", { lineHeight: "1.875rem", letterSpacing: "-0.016rem", fontWeight: "600" }],
        h3: ["1.125rem", { lineHeight: "1.5rem", letterSpacing: "-0.012rem", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.5rem", letterSpacing: "0", fontWeight: "400" }],
        small: ["0.8125rem", { lineHeight: "1.125rem", letterSpacing: "0", fontWeight: "500" }]
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        ink: "var(--ink)",
        mist: "var(--ink-55)",
        gold: "var(--gold)",
        red: "var(--red)",
        line: "var(--border)",
        "line-strong": "var(--border-2)",
        navy: "var(--ink)",
        deep: "var(--ink)",
        sky: "var(--surface-3)",
        accent: "var(--gold)",
        "ink-55": "var(--ink-55)",
        "ink-45": "var(--ink-45)"
      },
      boxShadow: {
        card: "0 8px 32px rgba(10, 22, 40, 0.08)",
        popover: "0 20px 48px rgba(10, 22, 40, 0.18)"
      },
      borderRadius: {
        card: "1rem",
        modal: "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;
