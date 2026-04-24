import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CountryBrowser } from "@/components/country/country-browser";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { RankedVenueList } from "@/components/venue/ranked-venue-list";
import { VenueCard } from "@/components/venue/venue-card";
import { Badge } from "@/components/ui/badge";
import { formatMatchStage } from "@/lib/data/matches";
import { getAllCountries, getCountryPageData } from "@/lib/data/repository";

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const countries = await getAllCountries();
  const country = countries.find((item) => item.slug === params.slug);

  if (!country) {
    return {
      title: "GameDay Map",
      description: "World Cup 2026 watch spots."
    };
  }

  return {
    title: `${country.name} fans · World Cup 2026 watch spots`,
    description: `World Cup 2026 venue discovery for ${country.supportersLabel}, with reservations, supporter hubs, and match-day spots across the host cities.`,
    openGraph: {
      images: [`/api/og?country=${country.slug}`]
    }
  };
}

export default async function CountryPage({
  params
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const [data, countries] = await Promise.all([getCountryPageData(slug), getAllCountries()]);

  if (!data) {
    notFound();
  }

  const neighborhoodOptions = Array.from(new Set(data.venues.map((venue) => venue.neighborhood))).sort();

  return (
    <div className="container-shell py-10">
      <section className="surface-strong p-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <CountryFlag country={data.country} size="lg" />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight text-deep">{data.country.name}</h1>
              <Badge>{data.country.fifaCode}</Badge>
              <Badge>{data.country.confederation}</Badge>
            </div>
            <p className="mt-4 max-w-2xl text-navy/72">
              World Cup 2026 venue discovery for {data.country.name} supporters, with reservation support, capacity signals, and curated match-day atmosphere notes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-sky/55 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-navy/55">Venue count</div>
              <div className="mt-2 text-3xl font-semibold text-deep">{data.venues.length}</div>
            </div>
            <div className="rounded-2xl bg-sky/55 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-navy/55">Best matchday spots</div>
              <div className="mt-2 text-3xl font-semibold text-deep">{data.featuredVenues.length}</div>
            </div>
            <div className="rounded-2xl bg-sky/55 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-navy/55">Best for groups</div>
              <div className="mt-2 text-3xl font-semibold text-deep">{data.largeGroupVenues.length}</div>
            </div>
            <div className="rounded-2xl bg-sky/55 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-navy/55">Reservable</div>
              <div className="mt-2 text-3xl font-semibold text-deep">{data.reservableVenues.length}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-8 xl:grid-cols-[1fr,0.75fr]">
        <RankedVenueList
          venues={data.featuredVenues.slice(0, 6)}
          title="Most trending places"
          subtitle="Top-ranked USA spots for this country, sorted by rank score and boosted by your saved favorites."
        />
        <div className="surface p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Upcoming games</div>
          <h2 className="mt-2 text-2xl font-semibold text-deep">Schedule first, venues second</h2>
          <p className="mt-3 text-sm leading-6 text-navy/72">
            Tap into the next fixtures for {data.country.name}, then jump back to the best places to watch them.
          </p>
          <div className="mt-5 grid gap-3">
            {data.matches.length ? (
              data.matches.map((match) => (
              <div key={match.id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold text-deep">
                      <span className="mr-1">{countries.find((country) => country.slug === match.homeCountry)?.flagEmoji ?? "🏁"}</span>
                      {countries.find((country) => country.slug === match.homeCountry)?.name ?? match.homeCountry}
                      <span className="mx-2 text-navy/40">vs</span>
                      <span className="mr-1">{countries.find((country) => country.slug === match.awayCountry)?.flagEmoji ?? "🏁"}</span>
                      {countries.find((country) => country.slug === match.awayCountry)?.name ?? match.awayCountry}
                    </div>
                    <Badge>{match.stageLabel ?? formatMatchStage(match.stage)}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-navy/65">
                    {new Date(match.startsAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </div>
                  <div className="mt-2 text-sm text-navy/65">
                    {match.stadiumName}, {match.city}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-navy/72">{match.note}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-sky/30 p-4 text-sm text-navy/65">
                No fixture scaffold is linked yet for this country.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-8 xl:grid-cols-4">
        <div className="space-y-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Best matchday spots</div>
            <div className="mt-2 grid gap-4">
              {data.featuredVenues.slice(0, 2).map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Best for large groups</div>
            <div className="mt-2 grid gap-4">
              {data.largeGroupVenues.slice(0, 2).map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Best for reservations</div>
            <div className="mt-2 grid gap-4">
              {data.reservableVenues.slice(0, 2).map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Authentic food + football vibe</div>
            <div className="mt-2 grid gap-4">
              {data.authenticVibeVenues.slice(0, 2).map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <CountryBrowser venues={data.venues} neighborhoods={neighborhoodOptions} />
      </section>
    </div>
  );
}
