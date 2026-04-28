"use client";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { Badge } from "@/components/ui/badge";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { getMatchLocationLabel } from "@/lib/data/matchLocations";
import { WorldCupMatch } from "@/lib/data/matches";
import { CountrySummary } from "@/lib/types";

function getCountry(countries: CountrySummary[], slug: string) {
  return countries.find((country) => country.slug === slug);
}

function getDateParts(value: string) {
  const date = new Date(value);
  return {
    dateKey: date.toLocaleDateString("en-CA", { timeZone: "America/New_York" }),
    dateLabel: date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/New_York"
    }),
    timeLabel: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York"
    })
  };
}

function getTodayKey() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function getTomorrowKey() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

export function MatchCard({
  match,
  countries,
  hostCityKey,
  hostCityLabel: _hostCityLabel,
  onWatchSpots,
  onRequestCitySelector
}: {
  match: WorldCupMatch;
  countries: CountrySummary[];
  hostCityKey: string;
  hostCityLabel?: string;
  onWatchSpots: (match: WorldCupMatch, cityKey: string) => void;
  onRequestCitySelector: () => void;
}) {
  const { userCity } = useUserCity();
  const { dateKey, dateLabel, timeLabel } = getDateParts(match.startsAt);
  const todayKey = getTodayKey();
  const tomorrowKey = getTomorrowKey();
  const home = getCountry(countries, match.homeCountry);
  const away = getCountry(countries, match.awayCountry);
  const stadiumLabel = getMatchLocationLabel(match);
  const isLocal = !!userCity && userCity === hostCityKey;
  const isToday = dateKey === todayKey;
  const isTomorrow = dateKey === tomorrowKey;

  return (
    <article className="rounded-[1.35rem] border border-[#d8e3f5] bg-white p-4 text-[#0a1628] shadow-sm dark:border-white/8 dark:bg-[#161b22] dark:text-white sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#0a1628] dark:text-white sm:text-base">
            <CountryFlag country={home} size="md" />
            <span>{home?.name ?? match.homeCountry}</span>
            <span className="text-[#0a1628]/40 dark:text-white/35">vs</span>
            <span>{away?.name ?? match.awayCountry}</span>
            <CountryFlag country={away} size="md" />
          </div>
          <div className="text-xs text-[#0a1628]/60 dark:text-white/55 sm:text-sm">
            {match.group ? `Group ${match.group}` : match.stageLabel} · {dateLabel} · {timeLabel} ET
          </div>
          <div className="text-xs text-[#0a1628]/60 dark:text-white/55 sm:text-sm">📍 {match.stadiumName}, {stadiumLabel}</div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          {isToday && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600 ring-1 ring-red-200">
              🔴 Today
            </span>
          )}
          {isTomorrow && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600 ring-1 ring-amber-200">
              ⚡ Tomorrow
            </span>
          )}
          {isLocal && <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0a1628] dark:bg-white/10 dark:text-white">📍 Local</span>}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-[0.2em] text-[#0a1628]/45">Where to watch</div>
        <div className="mt-2.5">
          {userCity ? (
            <button
              type="button"
              onClick={() => onWatchSpots(match, userCity)}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#f4b942] px-4 py-2.5 text-sm font-semibold text-[#0a1628] transition hover:bg-[#f0c86b] sm:w-auto"
            >
              📍 Find watch spots near you →
            </button>
          ) : (
            <button
              type="button"
              onClick={onRequestCitySelector}
              className="inline-flex w-full items-center justify-center rounded-full border border-[#d8e3f5] bg-white px-4 py-2.5 text-sm font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-auto"
            >
              📍 Find watch spots near you →
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge className="bg-[#eef4ff] text-[#0a1628] dark:bg-white/10 dark:text-white">{match.stageLabel}</Badge>
        {isToday && <Badge className="bg-red-50 text-red-700 ring-1 ring-red-200">Today</Badge>}
        {isTomorrow && <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200">Tomorrow</Badge>}
        {isLocal && <Badge className="bg-[#eef4ff] text-[#0a1628] dark:bg-white/10 dark:text-white">Local</Badge>}
      </div>
    </article>
  );
}
