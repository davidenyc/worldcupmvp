import Link from "next/link";

import { EmailCaptureBanner } from "@/components/marketing/EmailCaptureBanner";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { worldCup2026Matches } from "@/lib/data/matches";
import { getAdminQueue, getAllCountries, getMapPageData } from "@/lib/data/repository";
import { HomeCountryPicker } from "./HomeCountryPicker";
import { HomeHeroIntro } from "./HomeHeroIntro";
import { HomeMatchesStrip } from "./HomeMatchesStrip";
import { InstallAppBanner } from "./InstallAppBanner";
import { NorthAmericaMap } from "./NorthAmericaMap";
import { PremiumUpsellBanner } from "./PremiumUpsellBanner";

async function getCityVenueCount(cityKey: string) {
  const data = await getMapPageData(cityKey);
  return {
    venueCount: data.venues.length,
    reservableCount: data.venues.filter((venue) => venue.acceptsReservations).length
  };
}

function getMatchCount(cityKey: string) {
  return worldCup2026Matches.filter((match) => getMatchHostCityKey(match) === cityKey).length;
}

function getFeaturedMatchDay() {
  const now = Date.now();
  const upcoming = worldCup2026Matches
    .filter((match) => Date.parse(match.startsAt) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  if (!upcoming.length) {
    return { label: "Next match", matches: [] as typeof worldCup2026Matches };
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMatches = upcoming.filter((match) => match.startsAt.slice(0, 10) === todayKey);
  if (todayMatches.length) {
    return { label: "Today's matches", matches: todayMatches.slice(0, 6) };
  }

  const nextKey = upcoming[0]!.startsAt.slice(0, 10);
  return { label: "Next match day", matches: upcoming.filter((match) => match.startsAt.slice(0, 10) === nextKey).slice(0, 6) };
}

export async function USAHomepage() {
  const allCountries = await getAllCountries();
  const [{ submissions }, cityCards] = await Promise.all([
    getAdminQueue(),
    Promise.all(
      HOST_CITIES.map(async (city) => ({
        ...city,
        matchCount: getMatchCount(city.key),
        ...(await getCityVenueCount(city.key))
      }))
    )
  ]);

  const featuredMatchDay = getFeaturedMatchDay();
  const latestSubmissions = [...submissions]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 5);
  const totalVenues = cityCards.reduce((total, city) => total + city.venueCount, 0);
  const reservableVenues = cityCards.reduce((total, city) => total + city.reservableCount, 0);

  return (
    <main className="bg-bg text-deep">
      <section className="bg-bg">
        <div className="container-shell py-8 lg:py-12">
          <HomeHeroIntro />
          <HomeMatchesStrip label={featuredMatchDay.label} matches={featuredMatchDay.matches} countries={allCountries} />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="surface p-4">
              <div className="text-small uppercase tracking-[0.18em] text-ink-55">Host cities</div>
              <div className="mt-2 text-3xl font-semibold text-[color:var(--fg-primary)]">{cityCards.length}</div>
            </div>
            <div className="surface p-4">
              <div className="text-small uppercase tracking-[0.18em] text-ink-55">Venues</div>
              <div className="mt-2 text-3xl font-semibold text-[color:var(--fg-primary)]">{totalVenues.toLocaleString()}</div>
            </div>
            <div className="surface p-4">
              <div className="text-small uppercase tracking-[0.18em] text-ink-55">Reservations</div>
              <div className="mt-2 text-3xl font-semibold text-[color:var(--fg-primary)]">{reservableVenues.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <NorthAmericaMap cityCards={cityCards} />

          <section>
            <h2 className="text-xs uppercase tracking-[0.22em] text-mist">Browse by country</h2>
            <h3 className="mt-1 text-2xl font-bold text-deep">Tap the nation you&apos;re backing.</h3>
            <div className="mt-6">
              <HomeCountryPicker countries={allCountries} />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Pick your city", body: "Start with the host city where you'll actually be watching." },
              { title: "Pick your team", body: "Filter by country to find the crowd and the right room." },
              { title: "Go before kickoff", body: "See ratings, TV status, and reservation options fast." }
            ].map((step, index) => (
              <div key={step.title} className="surface p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-bold text-[color:var(--fg-on-accent)]">
                  {index + 1}
                </div>
                <h2 className="mt-4 text-h2 text-[color:var(--fg-primary)]">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--fg-secondary)]">{step.body}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="surface p-6">
              <div className="text-small uppercase tracking-[0.18em] text-ink-55">Latest community submissions</div>
              <h2 className="mt-2 text-h2 text-[color:var(--fg-primary)]">Fans are still adding rooms.</h2>
              <div className="mt-5 space-y-3">
                {latestSubmissions.length ? latestSubmissions.map((submission) => (
                  <div key={submission.id} className="rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-[color:var(--fg-primary)]">{submission.name}</div>
                      <span className="rounded-full bg-[var(--accent-soft-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-soft-fg)]">
                        {submission.status === "approved" ? "Approved" : "Pending review"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">
                      {submission.address} · {submission.countryAssociation}
                    </div>
                  </div>
                )) : (
                  <div className="empty-state">
                    <div className="empty-state-emoji">📍</div>
                    <p className="mt-3 text-sm text-[color:var(--fg-secondary)]">
                      No fresh submissions yet. Add a venue and we'll queue it for review.
                    </p>
                    <Link href="/submit" className="mt-4 inline-flex h-11 items-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)]">
                      Add a venue
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <InstallAppBanner />
              <PremiumUpsellBanner />
            </div>
          </section>

          <EmailCaptureBanner />
        </div>
      </section>
    </main>
  );
}
