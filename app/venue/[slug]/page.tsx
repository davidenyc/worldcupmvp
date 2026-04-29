import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import { LockedFeature } from "@/components/membership/LockedFeature";
import { PromoCard } from "@/components/promos/PromoCard";
import { EliteAccessCard } from "@/components/promos/EliteAccessCard";
import { FanGroupCreateForm } from "@/components/venue/FanGroupCreateForm";
import { ReportUpdateForm } from "@/components/venue/report-update-form";
import { ReservationRequestForm } from "@/components/venue/reservation-request-form";
import { ReviewSection } from "@/components/venue/ReviewSection";
import { VenueActionBar } from "@/components/venue/VenueActionBar";
import { SingleVenueLeafletMap } from "@/components/venue/SingleVenueLeafletMap";
import { VenueShareButton } from "@/components/venue/VenueShareButton";
import { VenueHero } from "@/components/venue/venue-hero";
import { VenueCard } from "@/components/venue/venue-card";
import { Badge } from "@/components/ui/badge";
import { demoVenues } from "@/lib/data/demo";
import { getHostCity } from "@/lib/data/hostCities";
import { getVenuePromos } from "@/lib/data/promos";
import { formatMatchStage, worldCup2026Matches } from "@/lib/data/matches";
import { getAllCountries, getMapPageData, getVenueDetails } from "@/lib/data/repository";
import {
  getVenueDescriptionCopy,
  getVenueEditorialCopy,
  getVenueMatchdayCopy,
  getVenueSupporterCopy,
  toTitleCase
} from "@/lib/utils";

function formatStarRating(rating: number | undefined | null) {
  if (!rating) return "★★★★☆";
  const rounded = Math.round(rating * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded % 1 !== 0;
  return `${"★".repeat(full)}${half ? "½" : ""}${"☆".repeat(Math.max(0, 5 - Math.ceil(rounded)))}`;
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getVenueDetails(params.slug);

  if (!data) {
    return {
      title: "Venue not found | GameDay Map"
    };
  }

  const venue = data.venue;
  const title = `${venue.name} — Watch World Cup 2026 | GameDay Map`;
  const description = `Watch World Cup 2026 at ${venue.name} in ${venue.neighborhood}, ${venue.city}. ${formatStarRating(venue.rating)} rated. ${toTitleCase(venue.venueIntent.replace(/_/g, " "))}. Directions, reservation requests, and more.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/venue/${venue.slug}`
    },
    openGraph: {
      type: "website",
      title,
      description,
      siteName: "GameDay Map",
      url: `/venue/${venue.slug}`,
      images: [`/api/og?type=venue&slug=${venue.slug}`]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?type=venue&slug=${venue.slug}`]
    }
  };
}

export async function generateStaticParams() {
  return demoVenues.map((venue) => ({ slug: venue.slug }));
}

export default async function VenuePage({
  params
}: {
  params: { slug: string };
}) {
  try {
    const { slug } = params;
    const [data, countries] = await Promise.all([getVenueDetails(slug), getAllCountries()]);

    if (!data) {
      notFound();
    }

    const curatedVenue = {
      ...data.venue,
      description: getVenueDescriptionCopy(data.venue, data.country?.name),
      editorialNotes: getVenueEditorialCopy(data.venue, data.country?.name),
      supporterNotes: getVenueSupporterCopy(data.venue, data.country?.name),
      matchdayNotes: getVenueMatchdayCopy(data.venue, data.country?.name)
    };

    const rankedVenue = {
      ...curatedVenue,
      rankScore: curatedVenue.gameDayScore,
      rankingReasons: [
        `Strong ${data.country?.name ?? "country"} match`,
        curatedVenue.acceptsReservations ? "Takes reservations" : "Walk-in friendly",
        curatedVenue.goodForGroups ? "Good for large watch parties" : "Neighborhood-scale vibe"
      ]
    };
    const venueCityKey = getHostCity(curatedVenue.city)?.key ?? "nyc";
    const cityMapData = await getMapPageData(venueCityKey);
    const venuePromos = getVenuePromos(venueCityKey, curatedVenue.slug, cityMapData.venues);
    const hasEliteAccess = Boolean(curatedVenue.elitePartner) || venuePromos.some((promo) => promo.tier_required === "elite");
    const venueMatches = data.matches.length
      ? data.matches
      : worldCup2026Matches
          .filter((match) => Date.parse(match.startsAt) >= Date.now())
          .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
          .slice(0, 4);

    return (
      <div>
        <VenueHero venue={rankedVenue} />
      <section className="container-shell py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <VenueActionBar
            venueSlug={curatedVenue.slug}
            venueName={curatedVenue.name}
            venueAddress={curatedVenue.address}
          />
          {curatedVenue.website ? (
            <a
              href={curatedVenue.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-deep px-4 py-2 text-sm font-semibold text-[color:var(--fg-on-strong)]"
            >
              Visit Website →
            </a>
          ) : null}
        </div>
      </section>
      {(venuePromos.length > 0 || hasEliteAccess) ? (
        <section className="container-shell py-2">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            {venuePromos.length > 0 ? (
              <div className="surface p-6">
                <div className="text-sm uppercase tracking-[0.2em] text-mist">Active deals at this venue</div>
                <h2 className="mt-2 text-2xl font-semibold text-deep">Today&apos;s promos and match-night perks</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {venuePromos.map((promo) => (
                    <PromoCard
                      key={promo.id}
                      promo={promo}
                      venueName={curatedVenue.name}
                      reservationUrl={curatedVenue.reservationUrl}
                      compact
                    />
                  ))}
                </div>
              </div>
            ) : null}
            {hasEliteAccess ? <EliteAccessCard venueId={curatedVenue.slug} venueName={curatedVenue.name} /> : null}
          </div>
        </section>
      ) : null}
      <section className="container-shell -mt-2 py-4">
        <div className="surface p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Upcoming matches to watch here</div>
          <h2 className="mt-2 text-2xl font-semibold text-deep">Matches that fit this crowd</h2>
          <div className="mt-4 grid gap-4">
            {venueMatches.map((match) => {
              const home = countries.find((country) => country.slug === match.homeCountry);
              const away = countries.find((country) => country.slug === match.awayCountry);
              return (
                <a
                  key={match.id}
                  href={`/${venueCityKey}/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}`}
                  className="rounded-3xl border border-line bg-surface px-4 py-4 text-deep transition hover:bg-surface-2 dark:border-line dark:bg-surface dark:text-deep dark:hover:bg-surface-2"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="text-2xl">{home?.flagEmoji ?? "🏁"}</span>
                    <span>{home?.name ?? match.homeCountry}</span>
                    <span className="text-[color:var(--ink-40)]">vs</span>
                    <span className="text-2xl">{away?.flagEmoji ?? "🏁"}</span>
                    <span>{away?.name ?? match.awayCountry}</span>
                    <span className="ml-auto rounded-full border border-line px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-secondary)]">
                      {match.stageLabel ?? formatMatchStage(match.stage)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-[color:var(--fg-secondary)]">
                    {new Date(match.startsAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "America/New_York"
                    })}
                    <span className="mx-2 text-[color:var(--ink-30)]">·</span>
                    {match.stadiumName}, {match.city}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--fg-secondary)]">{match.note}</p>
                  <div className="mt-3 text-sm font-semibold text-deep">Find watch spots →</div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
      <div className="container-shell grid gap-8 pb-12 lg:grid-cols-[0.7fr,0.3fr]">
        <div className="space-y-6">
          <section className="surface p-6">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Likely fan base</div>
            <h2 className="mt-2 text-2xl font-semibold text-deep">Why supporters show up here</h2>
            <p className="mt-4 text-navy/72">{curatedVenue.supporterNotes}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {rankedVenue.rankingReasons.map((reason) => (
                <Badge key={reason}>{reason}</Badge>
              ))}
            </div>
          </section>

          <section className="surface p-6">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Reservation and capacity</div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-mist">Approximate capacity</div>
                <div className="mt-2 text-3xl font-semibold text-deep">{curatedVenue.approximateCapacity ?? "--"}</div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-mist">Capacity source</div>
                <div className="mt-2 text-lg font-semibold text-deep">{curatedVenue.capacityConfidence.replace(/_/g, " ")}</div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-mist">Reservation type</div>
                <div className="mt-2 text-lg font-semibold text-deep">{curatedVenue.reservationType.replace(/_/g, " ")}</div>
              </div>
            </div>
            {curatedVenue.acceptsReservations && (
              <div className="mt-5 flex flex-wrap gap-3">
                {curatedVenue.reservationUrl && (
                  <a
                    href={curatedVenue.reservationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-[color:var(--fg-on-accent)]"
                  >
                    Reserve a spot
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {curatedVenue.reservationPhone && (
                  <a
                    href={`tel:${curatedVenue.reservationPhone}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy"
                  >
                    <Phone className="h-4 w-4" />
                    Call venue
                  </a>
                )}
              </div>
            )}
          </section>

          <section className="surface p-6">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Amenities</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {curatedVenue.venueTypes.map((type) => (
                <Badge key={type}>{toTitleCase(type.replace(/_/g, " "))}</Badge>
              ))}
              {curatedVenue.cuisineTags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
              <Badge>{curatedVenue.numberOfScreens} screens</Badge>
              {curatedVenue.hasProjector && <Badge>Projector</Badge>}
              {curatedVenue.hasOutdoorViewing && <Badge>Outdoor seating</Badge>}
              {curatedVenue.familyFriendly && <Badge>Family friendly</Badge>}
              {curatedVenue.standingRoomFriendly && <Badge>Standing-room friendly</Badge>}
              {curatedVenue.privateEventsAvailable && <Badge>Private events</Badge>}
            </div>
            <p className="mt-4 text-sm text-navy/72">{curatedVenue.matchdayNotes}</p>
          </section>

          <SingleVenueLeafletMap venue={rankedVenue} countries={countries} />

          <section className="surface p-6">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Best matches to watch here</div>
            <h2 className="mt-2 text-2xl font-semibold text-deep">Upcoming games tied to this venue</h2>
            <div className="mt-4 grid gap-4">
              {venueMatches.map((match) => {
                const home = countries.find((country) => country.slug === match.homeCountry);
                const away = countries.find((country) => country.slug === match.awayCountry);
                return (
                  <div key={match.id} className="rounded-2xl bg-white p-4 dark:bg-white/5">
                    <div className="font-semibold text-deep dark:text-white">
                      <span className="mr-1">{home?.flagEmoji ?? "🏁"}</span>
                      {home?.name ?? match.homeCountry}
                      <span className="mx-2 text-navy/40">vs</span>
                      <span className="mr-1">{away?.flagEmoji ?? "🏁"}</span>
                      {away?.name ?? match.awayCountry}
                    </div>
                    <div className="mt-2 text-sm text-navy/65 dark:text-white/65">
                      {new Date(match.startsAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}{" "}
                      · {match.stageLabel ?? formatMatchStage(match.stage)}
                    </div>
                    <p className="mt-2 text-sm text-navy/72 dark:text-white/72">{match.note}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="reservation-section" className="surface p-6">
            <ReservationRequestForm venueName={curatedVenue.name} venueSlug={curatedVenue.slug} />
          </section>

          <div id="review-section">
            <ReviewSection venueId={data.venue.id} />
          </div>

          <section className="surface p-6">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">⚽ Start a GameDay Crew</div>
            <h2 className="mt-2 text-2xl font-semibold text-deep">Create a crew for this venue</h2>
            <div className="mt-4">
              <FanGroupCreateForm
                cityKey={venueCityKey}
                venueId={curatedVenue.slug}
                venueName={curatedVenue.name}
                matches={data.matches}
              />
            </div>
          </section>

          <section className="surface p-6">
            <ReportUpdateForm />
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-deep">More spots for this crowd</h2>
              {data.country && (
                <Link href={`/country/${data.country.slug}`} className="text-sm text-accent">
                  Browse {data.country.name}
                </Link>
              )}
            </div>
            <div className="grid gap-4">
              {data.related.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="surface p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Quick info</div>
            <div className="mt-4 space-y-3 text-sm text-navy/72">
              <div>Country association: {data.country?.name ?? "Mixed"}</div>
              <div>Neighborhood: {data.venue.neighborhood}</div>
              <div>Borough: {data.venue.borough}</div>
              <div>Verification: {data.venue.verificationStatus.replace(/_/g, " ")}</div>
              <div>Source: {data.venue.sourceName}</div>
              <div>Source confidence: {Math.round(data.venue.sourceConfidence * 100)}%</div>
            </div>
          </div>
          <div className="surface p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Links</div>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="rounded-2xl bg-white px-4 py-3 text-navy dark:bg-white/5 dark:text-white">
                {data.venue.openNow ? "Open now" : "Hours vary"}
              </div>
              {data.venue.website && (
                <a href={data.venue.website} className="rounded-2xl bg-white px-4 py-3 text-navy dark:bg-white/5 dark:text-white">
                  Website
                </a>
              )}
              {data.venue.instagramUrl && (
                <a href={data.venue.instagramUrl} className="rounded-2xl bg-white px-4 py-3 text-navy dark:bg-white/5 dark:text-white">
                  Instagram
                </a>
              )}
              {data.venue.address && (
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(data.venue.address)}`}
                  className="rounded-2xl bg-white px-4 py-3 text-navy dark:bg-white/5 dark:text-white"
                >
                  Directions
                </a>
              )}
              <VenueShareButton
                venueName={data.venue.name}
                countryName={data.country?.name ?? "your team"}
                url={`https://gamedaymap.com/venue/${data.venue.slug}`}
              />
              {(data.venue.reservationPhone || data.venue.phone) && (
                <a
                  href={`tel:${data.venue.reservationPhone ?? data.venue.phone ?? ""}`}
                  className="rounded-2xl bg-white px-4 py-3 text-navy dark:bg-white/5 dark:text-white"
                >
                  Call
                </a>
              )}
              <LockedFeature feature="reservation_request" lockStyle="replace">
                {data.venue.acceptsReservations && data.venue.reservationUrl ? (
                  <a
                    href={data.venue.reservationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-white px-4 py-3 text-navy dark:bg-white/5 dark:text-white"
                  >
                    Reserve
                  </a>
                ) : (
                  <div className="rounded-2xl bg-white px-4 py-3 text-navy dark:bg-white/5 dark:text-white">
                    Reserve
                  </div>
                )}
              </LockedFeature>
            </div>
          </div>
        </aside>
      </div>
      <section className="container-shell pb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-deep">More spots near this one</h2>
          <div className="text-sm text-navy/60">Closest venues by lat/lng</div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {data.nearby.map((venue) => {
            const flagEmoji = countries.find((country) => country.slug === venue.likelySupporterCountry)?.flagEmoji ?? "📍";
            const intentLabel =
              venue.venueIntent === "fan_fest"
                ? "🏆 Fan Fest"
                : venue.venueIntent === "sports_bar"
                  ? "⚽ Sports bar"
                  : venue.venueIntent === "bar_with_tv"
                    ? "📺 Bar with TVs"
                  : venue.venueIntent === "cultural_bar"
                    ? "🍺 Cultural bar"
                    : "🍽️ Cultural restaurant";
            return (
              <Link
                key={venue.id}
                href={`/venue/${venue.slug}`}
                className="surface p-4 transition hover:border-accent/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-deep">
                    <span className="text-2xl">{flagEmoji}</span>
                    <div className="font-semibold">{venue.name}</div>
                  </div>
                  <Badge className="bg-sky-100 text-sky-800">{intentLabel}</Badge>
                </div>
                <div className="mt-2 text-sm text-navy/70">{venue.neighborhood}</div>
              </Link>
            );
          })}
        </div>
      </section>
      </div>
    );
  } catch {
    notFound();
  }
}
