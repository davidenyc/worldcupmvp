import Link from "next/link";

import { CountrySummary } from "@/lib/types";
import { formatMatchStage, WorldCupMatch } from "@/lib/data/matches";

function getFlag(countries: CountrySummary[], slug: string) {
  return countries.find((country) => country.slug === slug)?.flagEmoji ?? "🏁";
}

function getCountryName(countries: CountrySummary[], slug: string) {
  return countries.find((country) => country.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

export function MatchScheduleStrip({
  cityKey = "nyc",
  countries,
  matches
}: {
  cityKey?: string;
  countries: CountrySummary[];
  matches: WorldCupMatch[];
}) {
  return (
    <section className="overflow-hidden bg-bg py-3 dark:bg-[var(--bg-surface-strong)]">
      <div className="container-shell">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-45)] dark:text-[color:var(--fg-on-strong)]">Today and upcoming</div>
          <div className="text-xs text-[color:var(--ink-45)] dark:text-[color:var(--fg-on-strong)]">{matches.length} matches</div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {matches.map((match) => (
            <Link
              key={match.id}
              href={`/${cityKey}/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}`}
              className="min-w-[18rem] flex-1 rounded-2xl border border-line bg-surface px-4 py-3 text-deep transition hover:bg-surface-2 dark:border-line dark:bg-white/5 dark:text-[color:var(--fg-on-strong)] dark:hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-deep dark:text-[color:var(--fg-on-strong)]">
                  <span className="mr-1">{getFlag(countries, match.homeCountry)}</span>
                  {getCountryName(countries, match.homeCountry)}
                  <span className="mx-2 text-[color:var(--ink-45)] dark:text-[color:var(--fg-on-strong)]">vs</span>
                  <span className="mr-1">{getFlag(countries, match.awayCountry)}</span>
                  {getCountryName(countries, match.awayCountry)}
                </div>
                <span className="rounded-full border border-line px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-secondary)] dark:border-line dark:text-[color:var(--fg-on-strong)]">
                  {match.stageLabel ?? formatMatchStage(match.stage)}
                </span>
              </div>
              <div className="mt-2 text-xs text-[color:var(--fg-secondary)] dark:text-[color:var(--fg-on-strong)]">
                {new Date(match.startsAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "America/New_York"
                })}
                <span className="mx-2 text-[color:var(--ink-30)] dark:text-[color:var(--fg-on-strong)]">·</span>
                {match.city}
              </div>
              <div className="mt-1 text-xs text-[color:var(--ink-45)] dark:text-[color:var(--fg-on-strong)]">{match.stadiumName}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
