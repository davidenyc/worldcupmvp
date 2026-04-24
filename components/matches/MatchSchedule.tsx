"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CountrySummary } from "@/lib/types";
import { WorldCupMatch } from "@/lib/data/matches";

type ScheduleTab = "all" | "ny" | "group" | "knockouts";

function getCountry(countries: CountrySummary[], slug: string) {
  return countries.find((country) => country.slug === slug);
}

function getDateKey(value: string) {
  return new Date(value).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function isToday(value: string) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  return getDateKey(value) === today;
}

export function MatchSchedule({
  countries,
  matches
}: {
  countries: CountrySummary[];
  matches: WorldCupMatch[];
}) {
  const [tab, setTab] = useState<ScheduleTab>("all");

  const filtered = useMemo(() => {
    return matches.filter((match) => {
      if (tab === "ny") return match.venue.city === "New York" || match.venue.stadium === "MetLife Stadium";
      if (tab === "group") return match.stage.toLowerCase().includes("group");
      if (tab === "knockouts") return !match.stage.toLowerCase().includes("group");
      return true;
    });
  }, [matches, tab]);

  const grouped = useMemo(() => {
    const map = new Map<string, WorldCupMatch[]>();
    filtered
      .slice()
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
      .forEach((match) => {
        const key = getDateKey(match.startsAt);
        const list = map.get(key) ?? [];
        list.push(match);
        map.set(key, list);
      });
    return Array.from(map.entries()).sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {([
          ["all", "All"],
          ["ny", "New York/NJ"],
          ["group", "Group Stage"],
          ["knockouts", "Knockouts"]
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === key ? "bg-navy text-white shadow-card" : "border border-line bg-white text-navy hover:bg-sky/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {grouped.map(([date, dayMatches]) => (
          <section key={date} className="surface p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-mist">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                  })}
                </div>
                <div className="mt-1 text-sm text-navy/65">{dayMatches.length} matches</div>
              </div>
              {dayMatches.some((match) => isToday(match.startsAt)) && (
                <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700">
                  🔴 Today
                </span>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dayMatches.map((match) => {
                const home = getCountry(countries, match.homeCountry);
                const away = getCountry(countries, match.awayCountry);
                const local = match.venue.stadium === "MetLife Stadium";
                return (
                  <article key={match.id} className="rounded-3xl border border-line bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold text-deep">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{home?.flagEmoji ?? "🏁"}</span>
                          <span>{home?.name ?? match.homeCountry}</span>
                        </div>
                        <div className="my-2 text-xs uppercase tracking-[0.2em] text-mist">vs</div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{away?.flagEmoji ?? "🏁"}</span>
                          <span>{away?.name ?? match.awayCountry}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-right">
                        {local && (
                          <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-800">
                            📍 Local
                          </span>
                        )}
                        <span className="rounded-full border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/70">
                          {match.stage}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-navy/70">
                      {new Date(match.startsAt).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "America/New_York"
                      })}
                      <span className="mx-2 text-navy/30">·</span>
                      {match.venue.stadium}, {match.venue.city}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-navy/65">{match.note}</p>
                    <div className="mt-4">
                      <Link
                        href={`/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}`}
                        className="inline-flex items-center justify-center rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy/90"
                      >
                        Find NYC spots →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
