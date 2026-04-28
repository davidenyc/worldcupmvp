"use client";

import { MapPin } from "lucide-react";

import { getHostCity } from "@/lib/data/hostCities";
import { useUserCity } from "@/lib/hooks/useUserCity";

export function HomeCityPrompt() {
  const { userCity, suggestedCity, setUserCity } = useUserCity();
  const activeCity = getHostCity(userCity ?? suggestedCity ?? "nyc") ?? getHostCity("nyc");

  return (
    <div className="surface inline-flex w-full max-w-xl flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-2 text-small uppercase tracking-[0.18em] text-ink-55">
          <MapPin className="h-4 w-4" />
          Watching from {activeCity?.label ?? "New York"}?
        </div>
        <p className="mt-2 text-sm text-[color:var(--fg-secondary)]">
          We&apos;ll set your city first so every match, venue, and alert starts in the right place.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setUserCity(activeCity?.key ?? "nyc")}
          className="inline-flex h-11 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)]"
        >
          Yes, show {activeCity?.shortLabel ?? "NYC"}
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("gameday:open-city-switcher"))}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-subtle)] px-4 text-sm font-semibold text-[color:var(--fg-primary)]"
        >
          Pick a different city
        </button>
      </div>
    </div>
  );
}
