"use client";

import { getHostCity } from "@/lib/data/hostCities";
import { useUserCity } from "@/lib/hooks/useUserCity";

export function HomeCityPrompt() {
  const { userCity, suggestedCity } = useUserCity();
  const activeCity = getHostCity(userCity ?? suggestedCity ?? "nyc") ?? getHostCity("nyc");

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("gameday:open-city-switcher"))}
      className="inline-flex min-h-11 items-center gap-1 text-sm text-[color:var(--fg-secondary)] transition hover:text-[color:var(--fg-primary)]"
    >
      <span>Not in {activeCity?.label ?? "New York"}?</span>
      <span className="font-semibold text-[color:var(--fg-primary)]">Pick another →</span>
    </button>
  );
}
