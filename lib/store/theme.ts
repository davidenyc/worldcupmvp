"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "gameday-theme";
const THEME_EVENT = "gameday-theme-change";

let currentTheme: Theme = "light";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  currentTheme = theme;
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
}

function setTheme(theme: Theme) {
  applyTheme(theme);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, theme);
    window.dispatchEvent(new Event(THEME_EVENT));
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleThemeChange = () => {
    currentTheme = getInitialTheme();
    callback();
  };

  window.addEventListener(THEME_EVENT, handleThemeChange);
  window.addEventListener("storage", handleThemeChange);

  return () => {
    window.removeEventListener(THEME_EVENT, handleThemeChange);
    window.removeEventListener("storage", handleThemeChange);
  };
}

function getSnapshot() {
  return currentTheme;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light");

  useEffect(() => {
    const initial = getInitialTheme();
    applyTheme(initial);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(THEME_EVENT));
    }
  }, []);

  function toggle() {
    const next: Theme = currentTheme === "dark" ? "light" : "dark";
    setTheme(next);
  }

  return { theme, toggle, isDark: theme === "dark" };
}
