"use client";

import { getHostCity } from "@/lib/data/hostCities";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { HomeCityPrompt } from "./HomeCityPrompt";

export function HomeHeroIntro() {
  const { userCity, suggestedCity } = useUserCity();
  const activeCity = getHostCity(userCity ?? suggestedCity ?? "nyc") ?? getHostCity("nyc");

  return (
    <div className="max-w-4xl">
      <div className="text-small uppercase tracking-[0.18em] text-ink-55">World Cup 2026</div>
      <h1 className="text-3xl font-bold leading-[1.05] tracking-tight text-deep sm:text-4xl md:text-5xl lg:text-6xl">
        Find your watch party in {activeCity?.label ?? "New York"}.
      </h1>
      <p className="mt-3 text-base text-mist sm:text-lg">Matches today. Bars tonight.</p>
      <div className="mt-2">
        <HomeCityPrompt />
      </div>
    </div>
  );
}
