// Offline helper panel for /offline that surfaces cached city routes and the next 48 hours of matches.
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getHostCity } from "@/lib/data/hostCities";
import { worldCup2026Matches } from "@/lib/data/matches";

const CACHE_NAME = "gameday-map-v3";
const USER_CITY_STORAGE_KEY = "userCity";

type CachedCityLink = {
  href: string;
  label: string;
};

export function OfflineReadinessPanel() {
  const [cachedCityLink, setCachedCityLink] = useState<CachedCityLink | null>(null);

  const upcomingMatches = useMemo(() => {
    const now = Date.now();
    const in48Hours = now + 1000 * 60 * 60 * 48;
    return worldCup2026Matches
      .filter((match) => {
        const startsAt = Date.parse(match.startsAt);
        return startsAt >= now && startsAt <= in48Hours;
      })
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
      .slice(0, 4);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const findCachedCity = async () => {
      const storedCity = window.localStorage.getItem(USER_CITY_STORAGE_KEY) ?? "nyc";
      const candidates = [storedCity, "nyc"];

      if (!("caches" in window)) {
        const city = getHostCity(storedCity);
        if (!cancelled) {
          setCachedCityLink({
            href: `/${city?.key ?? storedCity}/map`,
            label: city?.label ?? "Your city"
          });
        }
        return;
      }

      try {
        const cache = await caches.open(CACHE_NAME);

        for (const cityKey of candidates) {
          const cached = await cache.match(`/${cityKey}/map`);
          if (cached) {
            const city = getHostCity(cityKey);
            if (!cancelled) {
              setCachedCityLink({
                href: `/${cityKey}/map`,
                label: city?.label ?? cityKey.toUpperCase()
              });
            }
            return;
          }
        }
      } catch {
        const city = getHostCity(storedCity);
        if (!cancelled) {
          setCachedCityLink({
            href: `/${city?.key ?? storedCity}/map`,
            label: city?.label ?? "Your city"
          });
        }
      }
    };

    void findCachedCity();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-left backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--fg-secondary-on-strong)]">
          Cached city guide
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-[color:var(--fg-on-strong)]">
          Jump back into a city map you already opened.
        </h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--fg-secondary-on-strong)]">
          We keep your shell and recent city pages handy so you can still find the right room when signal drops.
        </p>
        {cachedCityLink ? (
          <Link
            href={cachedCityLink.href}
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)]"
          >
            Open {cachedCityLink.label} map →
          </Link>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-[color:var(--fg-secondary-on-strong)]">
            Open a city map once while you&apos;re online and it will show up here automatically.
          </div>
        )}
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-left backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--fg-secondary-on-strong)]">
          Next 48 hours
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-[color:var(--fg-on-strong)]">
          Today&apos;s schedule stays readable.
        </h2>
        <div className="mt-4 space-y-3">
          {upcomingMatches.length ? (
            upcomingMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-[color:var(--fg-secondary-on-strong)]"
              >
                <div className="font-semibold text-[color:var(--fg-on-strong)]">
                  {match.homeCountry.toUpperCase()} vs {match.awayCountry.toUpperCase()}
                </div>
                <div className="mt-1">
                  {new Date(match.startsAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}{" "}
                  · {match.city}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-[color:var(--fg-secondary-on-strong)]">
              No scheduled matches in the next 48 hours.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm font-semibold text-[color:var(--fg-on-strong)]"
        >
          Reconnect
        </button>
      </section>
    </div>
  );
}
