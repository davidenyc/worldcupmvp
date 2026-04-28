"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "gameday-theme";
const THEME_EVENT = "gameday-theme-change";

function getStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function resolveTheme(theme: ThemePreference): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemePreference) {
  if (typeof document === "undefined") return;

  const resolvedTheme = resolveTheme(theme);
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
}

function emitThemeChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  const syncTheme = useCallback((nextTheme: ThemePreference) => {
    const nextResolved = resolveTheme(nextTheme);
    setThemeState(nextTheme);
    setResolvedTheme(nextResolved);
    applyTheme(nextTheme);
  }, []);

  useEffect(() => {
    syncTheme(getStoredThemePreference());
  }, [syncTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return () => undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleThemeChange = () => {
      syncTheme(getStoredThemePreference());
    };

    window.addEventListener(THEME_EVENT, handleThemeChange);
    window.addEventListener("storage", handleThemeChange);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleThemeChange);
    } else {
      mediaQuery.addListener(handleThemeChange);
    }

    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleThemeChange);
      } else {
        mediaQuery.removeListener(handleThemeChange);
      }
    };
  }, [syncTheme]);

  const setTheme = useCallback(
    (nextTheme: ThemePreference) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      }
      syncTheme(nextTheme);
      emitThemeChange();
    },
    [syncTheme]
  );

  const toggle = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return {
    theme,
    resolvedTheme,
    toggle,
    setTheme,
    isDark: resolvedTheme === "dark"
  };
}
