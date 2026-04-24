"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, MoveRight } from "lucide-react";

import { WorldMap } from "@/components/map/world-map";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CountrySummary } from "@/lib/types";

export function HeroWorldExplorer({
  countries,
  featuredCountries,
  venueCount,
  reservableCount
}: {
  countries: CountrySummary[];
  featuredCountries: CountrySummary[];
  venueCount: number;
  reservableCount: number;
}) {
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountrySummary>(featuredCountries[0] ?? countries[0]);

  const visibleCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(q) ||
        country.fifaCode.toLowerCase().includes(q) ||
        country.supporterKeywords.some((keyword) => keyword.toLowerCase().includes(q))
    );
  }, [countries, query]);

  return (
    <section className="container-shell py-10 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <Badge className="bg-white">
            <MapPin className="mr-2 h-3.5 w-3.5" />
            World Cup 2026 fan experience
          </Badge>
          <div>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-tight text-deep md:text-7xl">
              A lighter, smarter way to find your team&apos;s match-day scene across the host cities.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-navy/72">
              Browse every current 2026 World Cup participant, jump from the world map into a host city, and discover bars, restaurants, cafes, lounges, and community hubs with reservations and crowd-size context.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="surface p-5">
              <div className="text-sm text-mist">Countries</div>
              <div className="mt-2 text-4xl font-semibold text-deep">{countries.length}</div>
            </div>
            <div className="surface p-5">
              <div className="text-sm text-mist">Trending venues</div>
              <div className="mt-2 text-4xl font-semibold text-deep">{venueCount}</div>
            </div>
            <div className="surface p-5">
              <div className="text-sm text-mist">Reservation-ready spots</div>
              <div className="mt-2 text-4xl font-semibold text-deep">{reservableCount}</div>
            </div>
          </div>
          <div className="surface-strong overflow-hidden p-4">
            <div className="absolute" />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-mist">Flag picker</div>
                <div className="text-xl font-semibold text-deep">Fast mobile country search</div>
              </div>
              <div className="rounded-full bg-sky px-3 py-1 text-xs font-medium text-navy">
                {visibleCountries.length} visible
              </div>
            </div>
            <Input
              placeholder="Search by country, FIFA code, or supporter keyword"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="mt-4 grid max-h-[280px] grid-cols-2 gap-3 overflow-auto pr-1 sm:grid-cols-3">
              {visibleCountries.map((country) => (
                <Link
                  key={country.slug}
                  href={`/country/${country.slug}`}
                  onMouseEnter={() => setSelectedCountry(country)}
                  className={`block rounded-2xl border px-4 py-3 text-left transition ${
                    selectedCountry.slug === country.slug
                      ? "border-accent bg-sky"
                      : "border-line bg-white hover:bg-sky/70"
                  }`}
                >
                  <div className="text-2xl">{country.flagEmoji}</div>
                  <div className="mt-2 font-semibold text-deep">{country.name}</div>
                  <div className="text-xs text-navy/65">{country.fifaCode}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <WorldMap
              countries={countries}
              selectedCountrySlug={selectedCountry.slug}
              onCountryFocus={setSelectedCountry}
            />
            <div className="pointer-events-none absolute bottom-10 right-8 hidden rounded-full border border-white bg-white/85 px-4 py-2 text-sm text-navy shadow-card md:block">
              USA
            </div>
            <svg
              className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M65,33 C74,45 82,49 89,66"
                fill="none"
                stroke="#5eb6ff"
                strokeDasharray="3 3"
                strokeWidth="1.2"
                opacity="0.85"
              />
            </svg>
          </div>
          <div className="surface-strong p-5">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedCountry.flagEmoji}</span>
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-mist">Currently highlighted</div>
                <div className="text-2xl font-semibold text-deep">{selectedCountry.name}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-navy/72">
              {selectedCountry.supportersLabel}. Explore curated and imported host-city venues with supporter relevance, reservations, and watch-party sizing signals.
            </p>
            <Link
              href={`/country/${selectedCountry.slug}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              Open country page
              <MoveRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
