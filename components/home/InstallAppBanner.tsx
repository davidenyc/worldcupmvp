"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gameday_map_install_banner_dismissed";

export function InstallAppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const appleStandalone =
      typeof window.navigator !== "undefined" &&
      "standalone" in window.navigator &&
      window.navigator.standalone === true;

    if (!dismissed && !standalone && !appleStandalone && window.innerWidth < 1024) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="rounded-[1.75rem] bg-gold px-4 py-4 text-deep shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-6">
          📲 Add GameDay Map to your home screen — tap Share → Add to Home Screen
        </p>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "1");
            setVisible(false);
          }}
          className="rounded-full border border-[color:var(--border-strong)] bg-white/65 px-3 py-1 text-xs font-bold text-deep"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
