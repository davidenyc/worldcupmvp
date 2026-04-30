"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { trackLiveActivityTickerView } from "@/lib/analytics/track";
import { socialMock } from "@/lib/data/socialMock";

export function LiveActivityTicker({ cityKey = "nyc" }: { cityKey?: string }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [trackedView, setTrackedView] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (trackedView) return;

    const ticker = document.getElementById("live-activity-ticker");
    if (!ticker) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        trackLiveActivityTickerView({ cityKey });
        setTrackedView(true);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(ticker);
    return () => observer.disconnect();
  }, [cityKey, trackedView]);

  const entries = useMemo(
    () =>
      reducedMotion
        ? socialMock.slice(0, 4)
        : [...socialMock, ...socialMock],
    [reducedMotion]
  );

  return (
    <section id="live-activity-ticker" className="overflow-hidden rounded-[1.2rem] bg-deep text-[color:var(--fg-on-strong)]">
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
              <Link
                key={entry.id}
                href={entry.href}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[color:var(--fg-on-strong)] transition hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              >
                <span>{entry.avatar}</span>
                <span>{entry.label}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="group flex min-h-9 items-center overflow-hidden py-2">
            <div
              className="live-ticker-track flex min-w-max items-center gap-4 whitespace-nowrap px-4 text-sm text-[color:var(--fg-on-strong)] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
              aria-label="Live fan activity"
            >
              {entries.map((entry, index) => (
                <Link
                  key={`${entry.id}-${index}`}
                  href={entry.href}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[color:var(--fg-on-strong)] transition hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  <span>{entry.avatar}</span>
                  <span>{entry.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
