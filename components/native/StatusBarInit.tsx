"use client";

import { useEffect } from "react";

export function StatusBarInit() {
  useEffect(() => {
    async function init() {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const { Capacitor } = await import("@capacitor/core");

        if (!Capacitor.isNativePlatform()) return;

        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0a1628" });
      } catch {
        // Native-only feature; ignore on web.
      }
    }

    init();
  }, []);

  return null;
}
