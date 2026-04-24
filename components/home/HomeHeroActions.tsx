"use client";

import Link from "next/link";

import { getHostCity } from "@/lib/data/hostCities";
import { useUserCity } from "@/lib/hooks/useUserCity";

export function HomeHeroActions() {
  const { userCity, suggestedCity } = useUserCity();
  const activeCityKey = userCity ?? suggestedCity ?? "nyc";
  const activeCity = getHostCity(activeCityKey) ?? getHostCity("nyc");

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/${activeCity?.key ?? "nyc"}/map`}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#f4b942] px-4 py-3 text-sm font-semibold text-[#0a1628] shadow-card transition hover:bg-[#f0c86b] sm:w-fit sm:justify-start sm:py-2.5"
      >
        Explore your city
      </Link>
    </div>
  );
}
