 "use client";

import { useEffect, useState } from "react";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { CountrySummary } from "@/lib/types";
import { WorldCupMatch } from "@/lib/data/matches";

function getCountry(countries: CountrySummary[], slug: string) {
  return countries.find((country) => country.slug === slug);
}

export function MatchdayBanner({
  countries,
  match,
  topNeighborhood,
  onApplyMatch,
  onDismiss
}: {
  countries: CountrySummary[];
  match: WorldCupMatch | null;
  topNeighborhood?: string | null;
  onApplyMatch: (match: WorldCupMatch) => void;
  onDismiss?: () => void;
}) {
  if (!match) return null;

  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    setMobileExpanded(false);
  }, [match.id]);

  const home = getCountry(countries, match.homeCountry);
  const away = getCountry(countries, match.awayCountry);
  const kickOff = new Date(match.startsAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York"
  });
  const stadiumLabel = match.isNYNJ ? "MetLife Stadium" : match.stadiumName;

  return (
    <>
      <div className="hidden w-full items-center gap-3 rounded-2xl bg-red-600 px-4 py-3 text-white shadow-2xl md:flex">
        <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
          🔴 Matchday
        </span>
        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <CountryFlag country={home} size="sm" />
            <span>{home?.name ?? match.homeCountry}</span>
          </span>
          <span className="text-white/80">vs</span>
          <span className="flex items-center gap-2">
            <span>{away?.name ?? match.awayCountry}</span>
            <CountryFlag country={away} size="sm" />
          </span>
          <span className="hidden md:inline text-white/80">·</span>
          <span className="text-white/90">Kick off {kickOff} ET</span>
          <span className="hidden lg:inline text-white/80">· {stadiumLabel}</span>
          {topNeighborhood ? <span className="hidden xl:inline text-white/90">· 🔥 {topNeighborhood} crowd is biggest</span> : null}
        </div>
        <button
          type="button"
          onClick={() => onApplyMatch(match)}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Find spots →
        </button>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss match alert"
            className="ml-1 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      <div className="md:hidden">
        <div className="rounded-2xl bg-red-600 text-white shadow-2xl">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <span className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/90">
              Match
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                <span className="mr-1 inline-flex align-middle"><CountryFlag country={home} size="sm" /></span>
                {home?.name ?? match.homeCountry}
                <span className="mx-1.5 text-white/75">vs</span>
                {away?.name ?? match.awayCountry}
                <span className="ml-1 inline-flex align-middle"><CountryFlag country={away} size="sm" /></span>
              </div>
              <div className="truncate text-[11px] text-white/80">
                {kickOff} ET
                <span className="mx-1">·</span>
                {stadiumLabel}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileExpanded((current) => !current)}
              className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              {mobileExpanded ? "Less" : "More"}
            </button>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss match alert"
                className="shrink-0 rounded-full p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {mobileExpanded ? (
            <div className="border-t border-white/15 px-3 pb-3 pt-2">
              <div className="text-xs font-medium text-white/85">
                Quick filter for this fixture and nearby watch spots.
              </div>
              {topNeighborhood ? (
                <div className="mt-2 text-xs font-medium text-white/85">🔥 {topNeighborhood} crowd is biggest</div>
              ) : null}
              <button
                type="button"
                onClick={() => onApplyMatch(match)}
                className="mt-2 w-full rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Find spots →
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
