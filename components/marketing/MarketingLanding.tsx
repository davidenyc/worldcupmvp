import Link from "next/link";

import { EditorialPick } from "@/components/home/EditorialPick";
import { FeaturedVenuesForMatch } from "@/components/home/FeaturedVenuesForMatch";
import { AliveMatchCard } from "@/components/home/AliveMatchCard";
import { ActionHeroError } from "@/components/home/ActionHero";
import { HomeViewTracker } from "@/components/home/HomeViewTracker";
import { LiveActivityTicker } from "@/components/home/LiveActivityTicker";
import { SocialProofBlock } from "@/components/home/SocialProofBlock";
import { EmailCaptureBanner } from "@/components/marketing/EmailCaptureBanner";
import { editorialPicks } from "@/lib/data/editorialPicks";
import { getAllCountries, getMapPageData } from "@/lib/data/repository";
import { getFallbackTonightFeed, getTonightFeed, type TonightFeed } from "@/lib/hooks/useTonightFeed";
import { getSeededGoingCount } from "@/lib/social/seededGoingCount";
import { getVenueImageSet } from "@/lib/utils/venueImages";
import { HomeScrollReset } from "./HomeScrollReset";
import { MarketingHeroActions } from "./MarketingHeroActions";

async function getResolvedTonightFeed() {
  try {
    return {
      feed: await getTonightFeed("nyc"),
      feedError: false
    };
  } catch {
    try {
      return {
        feed: await getFallbackTonightFeed("nyc"),
        feedError: false
      };
    } catch {
      return {
        feed: { hero: null, carousel: [], windowLabel: "Next match day" } satisfies TonightFeed,
        feedError: true
      };
    }
  }
}

function getPrimaryCountrySlug(
  hero: NonNullable<TonightFeed["hero"]>,
  preferredCountrySlug?: string
) {
  if (preferredCountrySlug && [hero.homeCountry.slug, hero.awayCountry.slug].includes(preferredCountrySlug)) {
    return preferredCountrySlug;
  }

  return hero.homeCountry.slug;
}

function getNeighborhoodFallbackImage(neighborhood: string) {
  const slug = neighborhood.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  switch (slug) {
    case "williamsburg":
      return "/neighborhoods/williamsburg.svg";
    case "bushwick":
      return "/neighborhoods/bushwick.svg";
    case "lower-east-side":
      return "/neighborhoods/lower-east-side.svg";
    case "chelsea":
      return "/neighborhoods/chelsea.svg";
    case "astoria":
      return "/neighborhoods/astoria.svg";
    default:
      return "/neighborhoods/default.svg";
  }
}

export async function MarketingLanding() {
  const [{ feed: tonightFeed, feedError }, activeMapData, allCountries] = await Promise.all([
    getResolvedTonightFeed(),
    getMapPageData("nyc"),
    getAllCountries()
  ]);
  const countryLookup = new Map(allCountries.map((country) => [country.slug, country] as const));
  const heroMatch = tonightFeed.hero;
  const featuredCountrySlug = heroMatch ? getPrimaryCountrySlug(heroMatch) : null;
  const featuredCountry = featuredCountrySlug ? countryLookup.get(featuredCountrySlug) ?? null : null;
  const featuredMatchVenues =
    heroMatch && featuredCountrySlug
      ? activeMapData.venues
          .filter((venue) => {
            if (
              venue.likelySupporterCountry === heroMatch.homeCountry.slug ||
              venue.likelySupporterCountry === heroMatch.awayCountry.slug
            ) {
              return true;
            }

            return (
              venue.associatedCountries.includes(heroMatch.homeCountry.slug) ||
              venue.associatedCountries.includes(heroMatch.awayCountry.slug)
            );
          })
          .map((venue) => ({
            slug: venue.slug,
            name: venue.name,
            neighborhood: venue.neighborhood,
            imageUrl: venue.imageUrls[0] ?? getVenueImageSet(venue)[0] ?? getNeighborhoodFallbackImage(venue.neighborhood),
            rating: venue.rating,
            goingCount: getSeededGoingCount(heroMatch.matchId, venue.slug, venue),
            acceptsReservations: venue.acceptsReservations,
            rankScore: venue.rankScore
          }))
          .sort((left, right) => right.goingCount - left.goingCount || right.rankScore - left.rankScore)
          .slice(0, 3)
      : [];
  const editorialSeed = featuredCountrySlug ? editorialPicks[featuredCountrySlug] ?? null : null;
  const editorialVenue = featuredMatchVenues[0] ?? null;
  const tonightFansPlanning = Math.round(
    tonightFeed.carousel.reduce((sum, match) => sum + match.projectedGoingCount, 0) * 2.7
  );
  const heroHref = tonightFeed.hero
    ? `/nyc/map?match=${tonightFeed.hero.matchId}&country=${featuredCountrySlug ?? tonightFeed.hero.homeCountry.slug}`
    : "/nyc/map";

  return (
    <main className="bg-bg text-[color:var(--fg-primary)]">
      <HomeScrollReset />
      <HomeViewTracker variant="marketing" />
      <section className="bg-[var(--bg-surface-strong)] text-[color:var(--fg-on-strong)]">
        <div className="container-shell py-10 sm:py-20">
          <LiveActivityTicker cityKey="nyc" />
          <div className="max-w-5xl">
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-secondary-on-strong)]">
              World Cup 2026 starts June 11
            </div>
            <h1 className="mt-3 text-[2.45rem] font-semibold tracking-tight leading-[1.02] sm:mt-4 sm:text-5xl lg:text-6xl">
              Find the room for your match.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[color:var(--fg-secondary-on-strong)] sm:mt-4 sm:text-lg">
              17 host cities. 48 nations. Match-night rooms that fit the crowd.
            </p>
            <MarketingHeroActions />
          </div>
        </div>
      </section>

      <section className="bg-bg">
        <div className="container-shell space-y-10 py-10 sm:space-y-12 sm:py-14">
          {tonightFeed.hero && featuredCountry ? (
            <FeaturedVenuesForMatch
              cityKey="nyc"
              countryLabel={featuredCountry.name}
              countrySlug={featuredCountry.slug}
              totalVenueCount={tonightFeed.hero.venueCount}
              venues={featuredMatchVenues}
              matchId={tonightFeed.hero.matchId}
            />
          ) : null}
          <section>
            <div className="text-xs uppercase tracking-[0.22em] text-mist">Matchday radar</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-deep">Where tonight gets decided.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--fg-secondary)] sm:text-base">
              Start with the match that matters, then follow the crowd to the room that already feels alive.
            </p>
            {tonightFeed.carousel.length ? (
              <div className="mt-6 space-y-4">
                <AliveMatchCard match={tonightFeed.carousel[0]} />
                {tonightFeed.carousel.length > 1 ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {tonightFeed.carousel.slice(1, 3).map((match) => (
                      <AliveMatchCard key={match.matchId} match={match} variant="compact" />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : feedError ? (
              <div className="mt-6">
                <ActionHeroError />
              </div>
            ) : (
              <div className="mt-6 surface flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-mist">{tonightFeed.windowLabel}</div>
                  <div className="text-lg font-semibold tracking-tight text-deep">The next match day is coming up.</div>
                  <p className="max-w-2xl text-sm leading-6 text-[color:var(--fg-secondary)]">
                    Pick your city or your team now, and we&apos;ll point you straight to the rooms most worth showing up for.
                  </p>
                </div>
                <MarketingHeroActions variant="compact" />
              </div>
            )}
          </section>
          {editorialSeed && editorialVenue ? (
            <EditorialPick
              eyebrow={editorialSeed.eyebrow}
              venueName={editorialVenue.name}
              neighborhood={editorialVenue.neighborhood}
              quote={editorialSeed.quote}
              venueHref={`/venue/${editorialVenue.slug}`}
            />
          ) : null}
          {tonightFansPlanning > 0 ? (
            <SocialProofBlock
              statLabel={`${tonightFansPlanning.toLocaleString()}+ NYC fans planning tonight`}
              href={heroHref}
              initialIndex={
                tonightFeed.hero
                  ? tonightFeed.hero.matchId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
                  : 0
              }
            />
          ) : null}

          <EmailCaptureBanner />

          <footer className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6 text-sm text-[color:var(--fg-secondary)]">
            <Link href="/about" className="font-medium text-deep">
              About
            </Link>
            <Link href="/privacy" className="font-medium text-deep">
              Privacy
            </Link>
            <Link href="/terms" className="font-medium text-deep">
              Terms
            </Link>
            <Link href="/membership" className="font-medium text-deep">
              Fan Pass · Elite · Free
            </Link>
            <span className="sm:ml-auto">World Cup 2026 watch parties for real supporter rooms.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
