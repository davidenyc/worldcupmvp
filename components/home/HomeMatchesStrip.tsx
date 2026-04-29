"use client";

import Link from "next/link";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { WatchToggleButton } from "@/components/matches/WatchToggleButton";
import { getHostCity } from "@/lib/data/hostCities";
import type { WorldCupMatch } from "@/lib/data/matches";
import type { CountrySummary } from "@/lib/types";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { KickoffCountdown } from "./KickoffCountdown";

function formatMatchPreviewTime(startsAt: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  const parts = formatter.formatToParts(new Date(startsAt));
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value ?? "";
  return `${month} ${day}, ${hour}:${minute} ${dayPeriod}`.trim();
}

export function HomeMatchesStrip({
  label,
  matches,
  countries
}: {
  label: string;
  matches: WorldCupMatch[];
  countries: CountrySummary[];
}) {
  const { userCity, suggestedCity } = useUserCity();
  const activeCity = getHostCity(userCity ?? suggestedCity ?? "nyc") ?? getHostCity("nyc");
  const countryLookup = new Map(countries.map((country) => [country.slug, country] as const));

  return (
    <div className="mt-6 rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-small uppercase tracking-[0.18em] text-ink-55">{label}</div>
          <div className="mt-1 text-xl font-semibold text-[color:var(--fg-primary)] sm:text-2xl">
            {matches.length ? "Start with today's slate, then jump straight into the right city map." : "Next match in a few days."}
          </div>
        </div>
        {!matches.length ? (
          <Link href="/matches" className="inline-flex max-w-max">
            <KickoffCountdown compact />
          </Link>
        ) : null}
      </div>

      {matches.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {matches.map((match) => {
            const home = countryLookup.get(match.homeCountry);
            const away = countryLookup.get(match.awayCountry);

            return (
              <div
                key={match.id}
                className="surface flex h-full flex-col justify-between p-4 transition hover:-translate-y-0.5"
              >
                <Link href={`/${activeCity?.key ?? "nyc"}/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}&match=${match.id}`}>
                  <div>
                    <div className="text-small uppercase tracking-[0.18em] text-ink-55">{formatMatchPreviewTime(match.startsAt)}</div>
                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[color:var(--fg-primary)]">
                      <CountryFlag country={home} size="sm" />
                      <span>{home?.fifaCode ?? match.homeCountry.toUpperCase()}</span>
                      <span className="text-ink-55">vs</span>
                      <CountryFlag country={away} size="sm" />
                      <span>{away?.fifaCode ?? match.awayCountry.toUpperCase()}</span>
                    </div>
                    <div className="mt-2 text-sm text-[color:var(--fg-secondary)]">{match.stageLabel} · {match.competition}</div>
                  </div>
                  <div className="mt-4 text-sm font-semibold text-[color:var(--fg-primary)]">
                    Watch in {activeCity?.label ?? "New York"} →
                  </div>
                </Link>
                <div className="mt-4">
                  <WatchToggleButton matchId={match.id} className="w-full" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-4 py-4">
          <span className="text-sm font-medium text-[color:var(--fg-secondary)]">No matches today.</span>
          <Link href="/matches" className="text-sm font-semibold text-[color:var(--fg-primary)]">
            See the full schedule →
          </Link>
        </div>
      )}
    </div>
  );
}
