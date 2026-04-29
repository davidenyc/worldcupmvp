"use client";

import { useEffect, useMemo, useState } from "react";

import { MatchCard } from "@/components/matches/MatchCard";
import { WatchSpotsDrawer } from "@/components/matches/WatchSpotsDrawer";
import { Badge } from "@/components/ui/badge";
import { HOST_CITIES, getHostCity } from "@/lib/data/hostCities";
import { HOST_CITY_STADIUMS, getMatchHostCityKey } from "@/lib/data/matchLocations";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { WorldCupMatch } from "@/lib/data/matches";
import { useUserCity } from "@/lib/hooks/useUserCity";
import { CountrySummary, Venue } from "@/lib/types";

type MatchTab = "all" | "stadium";

function getDateKey(value: string) {
  return new Date(value).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function openCitySwitcher() {
  window.dispatchEvent(new Event("gameday:open-city-switcher"));
}

export function MatchesPageClient({
  cityKey,
  countries,
  matches,
  venueCacheByCity
}: {
  cityKey: string;
  countries: CountrySummary[];
  matches: WorldCupMatch[];
  venueCacheByCity: Record<string, Venue[]>;
}) {
  const [tab, setTab] = useState<MatchTab>("all");
  const [activeMatch, setActiveMatch] = useState<WorldCupMatch | null>(null);
  const [drawerCityKey, setDrawerCityKey] = useState(cityKey);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const { userCity } = useUserCity();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const city = getHostCity(cityKey) ?? HOST_CITIES[0];
  const stadiumName = HOST_CITY_STADIUMS[city.key] ?? "Stadium";
  const userCityLabel = userCity ? getHostCity(userCity)?.label ?? userCity : null;

  const allMatches = useMemo(
    () => matches.slice().sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    [matches]
  );

  const stadiumMatches = useMemo(
    () => allMatches.filter((match) => getMatchHostCityKey(match) === city.key),
    [allMatches, city.key]
  );

  const filtered = useMemo(() => {
    if (tab === "stadium") return stadiumMatches;
    return allMatches;
  }, [allMatches, stadiumMatches, tab]);

  const grouped = useMemo(() => {
    const buckets = new Map<string, WorldCupMatch[]>();
    filtered.forEach((match) => {
      const key = getDateKey(match.startsAt);
      const list = buckets.get(key) ?? [];
      list.push(match);
      buckets.set(key, list);
    });
    return Array.from(buckets.entries()).sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]));
  }, [filtered]);

  useEffect(() => {
    if (isDesktop) {
      setExpandedDates(grouped.map(([date]) => date));
      return;
    }

    setExpandedDates((current) => {
      const validDates = grouped.map(([date]) => date);
      const preserved = current.filter((date) => validDates.includes(date));
      if (preserved.length > 0) return preserved;
      return validDates[0] ? [validDates[0]] : [];
    });
  }, [grouped, isDesktop]);

  const drawerVenues = activeMatch ? venueCacheByCity[drawerCityKey] ?? [] : [];

  const toggleDate = (date: string) => {
    if (isDesktop) return;
    setExpandedDates((current) =>
      current.includes(date) ? current.filter((item) => item !== date) : [...current, date]
    );
  };

  return (
    <div className="pb-16">
      <div className="sticky top-[73px] z-30 border-b border-line bg-white/90 backdrop-blur-md dark:border-line dark:bg-[var(--bg-surface-strong)]/95">
        <div className="container-shell flex flex-wrap items-start justify-between gap-4 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-45)] dark:text-[color:var(--fg-on-strong)]/45">{city.label}</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep dark:text-[color:var(--fg-on-strong)]">{city.label} Matches</h1>
            <div className="mt-2 text-sm text-mist dark:text-[color:var(--fg-muted-on-strong)]">
              {stadiumMatches.length} matches at {stadiumName} · {allMatches.length} total matches to watch
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-surface-2 text-deep dark:bg-white/10 dark:text-[color:var(--fg-on-strong)]">
              {userCityLabel ? `Watching from ${userCityLabel}` : `${city.label} selected`}
            </Badge>
            {!userCityLabel && (
              <button
                type="button"
                onClick={openCitySwitcher}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-deep transition hover:bg-surface-2 dark:border-line dark:bg-white/5 dark:text-[color:var(--fg-on-strong)] dark:hover:bg-white/10"
              >
                Set your city
              </button>
            )}
          </div>
        </div>

        <div className="container-shell pb-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All Matches"],
                ["stadium", `At ${stadiumName}`]
              ] as const
            ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    tab === key ? "bg-gold text-deep shadow-card" : "border border-line bg-white text-deep hover:bg-surface-2 dark:border-line dark:bg-white/5 dark:text-[color:var(--fg-on-strong)] dark:hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-1" aria-hidden />

      <div className="container-shell py-6 pt-5 sm:py-8 sm:pt-6">
        <div className="space-y-4 sm:space-y-8">
          {grouped.map(([date, dayMatches]) => (
            <section key={date} className="scroll-mt-[140px] overflow-hidden rounded-[1.6rem] border border-line bg-white shadow-sm dark:border-line dark:bg-[var(--bg-surface-strong)]">
              <button
                type="button"
                onClick={() => toggleDate(date)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5 sm:py-4"
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-45)] dark:text-[color:var(--fg-on-strong)]/45">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric"
                    })}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-deep dark:text-[color:var(--fg-on-strong)]">
                    {dayMatches.length} match{dayMatches.length === 1 ? "" : "es"}
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs font-semibold text-deep dark:border-line dark:bg-white/5 dark:text-[color:var(--fg-on-strong)]">
                  {expandedDates.includes(date) ? "Hide" : "Show"}
                </span>
              </button>
              {expandedDates.includes(date) ? (
                <div className="border-t border-line px-4 py-3 dark:border-line sm:px-5 sm:py-4">
                  <div className="grid gap-3 lg:grid-cols-2">
                    {dayMatches.map((match) => {
                      const resolvedHostCityKey = getMatchHostCityKey(match);
                      const hostCityKey = resolvedHostCityKey ?? cityKey;
                      const hostCityLabel = resolvedHostCityKey
                        ? getHostCity(hostCityKey)?.label ?? match.city
                        : match.city;
                      return (
                        <MatchCard
                          key={match.id}
                          match={match}
                          countries={countries}
                          hostCityKey={hostCityKey}
                          hostCityLabel={hostCityLabel}
                          onWatchSpots={(selectedMatch, nextCityKey) => {
                            setActiveMatch(selectedMatch);
                            setDrawerCityKey(nextCityKey);
                            setDrawerOpen(true);
                          }}
                          onRequestCitySelector={openCitySwitcher}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>

      <WatchSpotsDrawer
        open={drawerOpen}
        cityKey={drawerCityKey}
        cityLabel={getHostCity(drawerCityKey)?.label ?? drawerCityKey}
        match={activeMatch}
        venues={drawerVenues}
        countries={countries}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
