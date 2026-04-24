import Link from "next/link";

import { CountrySummary } from "@/lib/types";
import { WorldCupMatch } from "@/lib/data/matches";

function getFlag(countries: CountrySummary[], slug: string) {
  return countries.find((country) => country.slug === slug)?.flagEmoji ?? "🏁";
}

function getCountryName(countries: CountrySummary[], slug: string) {
  return countries.find((country) => country.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

export function MatchScheduleStrip({
  countries,
  matches
}: {
  countries: CountrySummary[];
  matches: WorldCupMatch[];
}) {
  return (
    <section className="overflow-hidden bg-gray-950 py-3">
      <div className="container-shell">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">Today / Upcoming</div>
          <div className="text-xs text-white/45">{matches.length} matches</div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {matches.map((match) => (
            <Link
              key={match.id}
              href={`/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}`}
              className="min-w-[18rem] flex-1 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white transition hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-white">
                  <span className="mr-1">{getFlag(countries, match.homeCountry)}</span>
                  {getCountryName(countries, match.homeCountry)}
                  <span className="mx-2 text-white/45">vs</span>
                  <span className="mr-1">{getFlag(countries, match.awayCountry)}</span>
                  {getCountryName(countries, match.awayCountry)}
                </div>
                <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70">
                  {match.stage}
                </span>
              </div>
              <div className="mt-2 text-xs text-white/65">
                {new Date(match.startsAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "America/New_York"
                })}
                <span className="mx-2 text-white/30">·</span>
                {match.venue.city}
              </div>
              <div className="mt-1 text-xs text-white/45">{match.venue.stadium}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
