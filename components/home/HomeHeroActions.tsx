"use client";

import Link from "next/link";

import { getHostCity } from "@/lib/data/hostCities";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { useUser } from "@/lib/store/user";

export function HomeHeroActions() {
  const { userCity, suggestedCity } = useUserCity();
  const user = useUser();
  const activeCityKey = userCity ?? suggestedCity ?? "nyc";
  const activeCity = getHostCity(activeCityKey) ?? getHostCity("nyc");
  const personalized = Boolean(user.favoriteCountrySlug);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href={personalized ? "/me" : "/welcome"}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gold px-6 text-base font-bold text-[color:var(--fg-on-accent)] shadow-card transition hover:brightness-[0.98] sm:w-auto"
      >
        {personalized ? "Open my Cup →" : "Personalize my Cup →"}
      </Link>
      <Link
        href={`/${activeCity?.key ?? "nyc"}/map`}
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] px-6 text-sm font-semibold text-[color:var(--fg-primary)] transition hover:bg-[var(--bg-surface-elevated)] sm:w-auto"
      >
        Find a watch spot →
      </Link>
    </div>
  );
}
