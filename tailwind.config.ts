import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16324f",
        field: "#f5fbff",
        sky: "#dff2ff",
        cloud: "#ffffff",
        mist: "#8aa7c2",
        line: "#bfdcf2",
        navy: "#214b73",
        accent: "#5eb6ff",
        deep: "#0d3252",
        card: "#eff8ff"
      },
      boxShadow: {
        glow: "0 20px 50px rgba(94, 182, 255, 0.18)",
        card: "0 18px 50px rgba(36, 78, 117, 0.12)"
      },
      backgroundImage: {
        "pitch-grid":
          "linear-gradient(rgba(33,75,115,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(33,75,115,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
