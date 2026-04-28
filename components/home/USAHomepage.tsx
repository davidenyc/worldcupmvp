import Link from "next/link";

import { CountryFlag } from "@/components/ui/CountryFlag";
import { EmailCaptureBanner } from "@/components/marketing/EmailCaptureBanner";
import { HOST_CITIES } from "@/lib/data/hostCities";
import { getMatchHostCityKey } from "@/lib/data/matchLocations";
import { worldCup2026Matches } from "@/lib/data/matches";
import { getAdminQueue, getAllCountries, getMapPageData } from "@/lib/data/repository";
import { HomeCityPrompt } from "./HomeCityPrompt";
import { HomeCountryPicker } from "./HomeCountryPicker";
import { HomeHeroActions } from "./HomeHeroActions";
import { InstallAppBanner } from "./InstallAppBanner";
import { KickoffCountdown } from "./KickoffCountdown";
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

function formatMatchPreviewTime(startsAt: string) {
  return new Date(startsAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export async function USAHomepage() {
  const allCountries = await getAllCountries();
  const countryLookup = new Map(allCountries.map((country) => [country.slug, country] as const));
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
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_22rem] lg:items-start">
            <div className="space-y-6">
              <div className="text-small uppercase tracking-[0.18em] text-ink-55">
                World Cup 2026 watch parties
              </div>
              <HomeCityPrompt />
              <div className="max-w-3xl">
                <h1 className="text-display text-[color:var(--fg-primary)] max-sm:text-5xl">
                  Find the right room before kickoff.
                </h1>
                <p className="mt-4 max-w-2xl text-body text-[color:var(--fg-secondary)]">
                  Matchday is the headline here: what city you&apos;re in, what&apos;s playing next, and which bar or restaurant is worth your crew.
                </p>
              </div>

              <HomeHeroActions />

              <div className="grid gap-3 sm:grid-cols-3">
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

            <div className="surface-strong p-5">
              <div className="text-small uppercase tracking-[0.18em] text-ink-55">Opening match countdown</div>
              <div className="mt-3 text-h2 text-[color:var(--fg-primary)]">Tournament starts at Estadio Azteca.</div>
              <div className="mt-4">
                <KickoffCountdown />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-card">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-small uppercase tracking-[0.18em] text-ink-55">{featuredMatchDay.label}</div>
                <div className="mt-1 text-h2 text-[color:var(--fg-primary)]">
                  {featuredMatchDay.matches.length ? "Start with today's slate, then jump straight into the right city map." : "Next match in a few days."}
                </div>
              </div>
            </div>

            {featuredMatchDay.matches.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {featuredMatchDay.matches.map((match) => {
                  const home = countryLookup.get(match.homeCountry);
                  const away = countryLookup.get(match.awayCountry);
                  const cityKey = getMatchHostCityKey(match) ?? "nyc";

                  return (
                    <Link
                      key={match.id}
                      href={`/${cityKey}/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}`}
                      className="surface flex h-full flex-col justify-between p-4 transition hover:-translate-y-0.5"
                    >
                      <div>
                        <div className="text-small uppercase tracking-[0.18em] text-ink-55">{formatMatchPreviewTime(match.startsAt)}</div>
                        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[color:var(--fg-primary)]">
                          <CountryFlag country={home} size="sm" />
                          <span>{home?.fifaCode ?? match.homeCountry.toUpperCase()}</span>
                          <span className="text-ink-55">vs</span>
                          <CountryFlag country={away} size="sm" />
                          <span>{away?.fifaCode ?? match.awayCountry.toUpperCase()}</span>
                        </div>
                        <div className="mt-2 text-sm text-[color:var(--fg-secondary)]">
                          {match.stadiumName} · {match.city}
                        </div>
                      </div>
                      <div className="mt-4 text-sm font-semibold text-[color:var(--fg-primary)]">Find a watch spot →</div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state mt-4">
                <div className="empty-state-emoji">⚽</div>
                <h2 className="mt-4 text-h2 text-[color:var(--fg-primary)]">The next slate is on deck</h2>
                <p className="mt-2 max-w-md text-sm text-[color:var(--fg-secondary)]">
                  We&apos;ll surface the upcoming match cards here as soon as the next fixture day begins.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-bg px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
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

          <NorthAmericaMap cityCards={cityCards} />

          <section>
            <div className="text-small uppercase tracking-[0.18em] text-ink-55">Browse by country</div>
            <h2 className="mt-2 text-h1 text-[color:var(--fg-primary)]">Tap the nation you're backing.</h2>
            <p className="mt-3 max-w-2xl text-body text-[color:var(--fg-secondary)]">
              Every country chip routes into the live city map with the right supporter filter already applied.
            </p>
            <div className="mt-6">
              <HomeCountryPicker countries={allCountries} />
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-small uppercase tracking-[0.18em] text-ink-55">Browse by city</div>
                <h2 className="mt-2 text-h1 text-[color:var(--fg-primary)]">All 17 host cities, trimmed for quick scanning.</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cityCards.map((city) => (
                <Link
                  key={city.key}
                  href={`/${city.key}/map`}
                  className="surface flex h-full flex-col gap-4 p-4 transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-[color:var(--fg-primary)]">{city.label}</div>
                      <div className="mt-1 text-sm text-[color:var(--fg-secondary)]">{city.stadiumName}</div>
                    </div>
                    <div className="rounded-full bg-[var(--bg-surface-elevated)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--fg-muted)]">
                      {city.shortLabel}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-small uppercase tracking-[0.16em] text-ink-55">Matches</div>
                      <div className="mt-1 font-semibold text-[color:var(--fg-primary)]">{city.matchCount}</div>
                    </div>
                    <div>
                      <div className="text-small uppercase tracking-[0.16em] text-ink-55">Venues</div>
                      <div className="mt-1 font-semibold text-[color:var(--fg-primary)]">{city.venueCount}</div>
                    </div>
                  </div>
                  <div className="mt-auto text-sm font-semibold text-[color:var(--fg-primary)]">Open city →</div>
                </Link>
              ))}
            </div>
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
