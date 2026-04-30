"use client";

import { useEffect, useMemo, useState } from "react";

import { socialMock } from "@/lib/data/socialMock";

export function LiveActivityTicker() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const entries = useMemo(
    () =>
      reducedMotion
        ? socialMock.slice(0, 4)
        : [...socialMock, ...socialMock],
    [reducedMotion]
  );

  return (
    <section className="overflow-hidden rounded-[1.2rem] bg-deep text-[color:var(--fg-on-strong)]">
      <div className="flex min-h-9 items-center gap-3 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--fg-secondary-on-strong)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          Live
        </span>
      </div>
      <div className="border-t border-white/10">
        {reducedMotion ? (
          <div className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-sm text-[color:var(--fg-on-strong)]">
            {entries.map((entry) => (
              <span key={entry.id} className="inline-flex items-center gap-2 whitespace-nowrap">
                <span>{entry.avatar}</span>
                <span>{entry.label}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="group flex min-h-9 items-center overflow-hidden py-2">
            <div
              className="flex min-w-max items-center gap-6 whitespace-nowrap px-4 text-sm text-[color:var(--fg-on-strong)] motion-safe:animate-[ticker_36s_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
              aria-label="Live fan activity"
            >
              {entries.map((entry, index) => (
                <span key={`${entry.id}-${index}`} className="inline-flex items-center gap-2">
                  <span>{entry.avatar}</span>
                  <span>{entry.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
