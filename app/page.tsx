import Link from "next/link";
import { ArrowRight, Building2, CalendarCheck2, Users2 } from "lucide-react";

import { FeaturedCountries } from "@/components/country/featured-countries";
import { CountryFlagsBanner } from "@/components/country/CountryFlagsBanner";
import { CountrySearch } from "@/components/country/country-search";
import { HeroWorldExplorer } from "@/components/map/hero-world-explorer";
import { MatchScheduleStrip } from "@/components/map/MatchScheduleStrip";
import { Badge } from "@/components/ui/badge";
import { RankedVenueList } from "@/components/venue/ranked-venue-list";
import { getUpcomingMatches, worldCup2026Matches } from "@/lib/data/matches";
import { getAllCountries, getFeaturedCountries, getMapPageData } from "@/lib/data/repository";

export default async function HomePage() {
  const [countries, featuredCountries, mapPageData] = await Promise.all([
    getAllCountries(),
    getFeaturedCountries(),
    getMapPageData()
  ]);
  const upcomingMatches = getUpcomingMatches().slice(0, 5);

  return (
    <div>
      <HeroWorldExplorer
        countries={countries}
        featuredCountries={featuredCountries}
        venueCount={mapPageData.venues.length}
        reservableCount={mapPageData.venues.filter((venue) => venue.acceptsReservations).length}
      />
      <CountryFlagsBanner countries={countries} />
      <MatchScheduleStrip countries={countries} matches={upcomingMatches} />

      <section className="container-shell py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-mist">NYC metro map</div>
            <h2 className="mt-2 text-3xl font-semibold text-deep">All NYC spots, every supporter flag</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-navy/72">
              Jump into the full map experience on the dedicated map page, where every venue can be filtered, ranked, and opened in detail.
            </p>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center justify-center rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-sky/60"
          >
            Open map
          </Link>
        </div>
        <div className="surface p-6 text-sm leading-6 text-navy/72">
          <p className="font-medium text-deep">Map preview</p>
          <p className="mt-2">
            The embedded overview stays lightweight here so the app can boot cleanly in the launcher. Use the map page for the full interactive experience.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-mist">Tracked venues</div>
              <div className="mt-2 text-2xl font-semibold text-deep">{mapPageData.venues.length}</div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-mist">Countries</div>
              <div className="mt-2 text-2xl font-semibold text-deep">{mapPageData.countries.length}</div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-mist">Reservation-ready</div>
              <div className="mt-2 text-2xl font-semibold text-deep">
                {mapPageData.venues.filter((venue) => venue.acceptsReservations).length}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface p-6">
            <Badge>
              <Building2 className="mr-2 h-3.5 w-3.5" />
              Venue depth
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold text-deep">More venue types, not just bars</h2>
            <p className="mt-3 text-sm leading-6 text-navy/72">
              Supporter clubs, cultural centers, bakeries, lounges, and restaurants all live in one normalized venue layer.
            </p>
          </div>
          <div className="surface p-6">
            <Badge>
              <CalendarCheck2 className="mr-2 h-3.5 w-3.5" />
              Reservation support
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold text-deep">Reservation and capacity-aware browsing</h2>
            <p className="mt-3 text-sm leading-6 text-navy/72">
              Spot venues that take bookings, estimate crowd size, or work for larger watch parties before match day arrives.
            </p>
          </div>
          <div className="surface p-6">
            <Badge>
              <Users2 className="mr-2 h-3.5 w-3.5" />
              Compliant ingestion
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold text-deep">Built for curated, provider-safe growth</h2>
            <p className="mt-3 text-sm leading-6 text-navy/72">
              Demo data first, then official APIs, CSV imports, manual curation, submissions, and partner connectors.
            </p>
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <RankedVenueList
          venues={mapPageData.venues.slice(0, 6)}
          title="Most trending places"
          subtitle="Top-ranked NYC venues right now, with favorites you save surfaced first in the list."
        />
      </section>

      <section className="container-shell py-8">
        <div className="surface p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Upcoming FIFA games</div>
          <h2 className="mt-2 text-3xl font-semibold text-deep">Match schedule first, venue discovery next</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-navy/72">
            Use the schedule to jump into the right country page, then pick the best NYC spot for the match you want to watch.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {worldCup2026Matches
              .slice()
              .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
              .slice(0, 3)
              .map((match) => (
                <div key={match.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-deep">
                      {match.homeCountry} vs {match.awayCountry}
                    </div>
                    <Badge>{match.competition}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-navy/65">
                    {new Date(match.startsAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-navy/72">{match.note}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <CountrySearch countries={countries} />
      </section>

      <section className="container-shell py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Featured countries</div>
            <h2 className="mt-2 text-3xl font-semibold text-deep">Popular supporter paths into NYC</h2>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-sky/60"
          >
            Learn about the data model
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <FeaturedCountries countries={featuredCountries} />
      </section>
    </div>
  );
}
