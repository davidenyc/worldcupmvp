import Link from "next/link";
import { ExternalLink, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import { ReportUpdateForm } from "@/components/venue/report-update-form";
import { ReservationRequestForm } from "@/components/venue/reservation-request-form";
import { SingleVenueLeafletMap } from "@/components/venue/SingleVenueLeafletMap";
import { VenueHero } from "@/components/venue/venue-hero";
import { VenueCard } from "@/components/venue/venue-card";
import { Badge } from "@/components/ui/badge";
import { formatMatchStage } from "@/lib/data/matches";
import { getAllCountries, getVenueDetails } from "@/lib/data/repository";
import { toTitleCase } from "@/lib/utils";

export default async function VenuePage({
  params
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const [data, countries] = await Promise.all([getVenueDetails(slug), getAllCountries()]);

  if (!data) {
    notFound();
  }

  const rankedVenue = {
    ...data.venue,
    rankScore: data.venue.gameDayScore,
    rankingReasons: [
      `Strong ${data.country?.name ?? "country"} match`,
      data.venue.acceptsReservations ? "Takes reservations" : "Walk-in friendly",
      data.venue.goodForGroups ? "Good for large watch parties" : "Neighborhood-scale vibe"
    ]
  };
  const venueCityKey = data.venue.city ?? "nyc";

  return (
    <div>
      <VenueHero venue={rankedVenue} />
      <section className="container-shell -mt-2 py-4">
        <div className="surface p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Upcoming matches to watch here</div>
          <h2 className="mt-2 text-2xl font-semibold text-deep">Matches that fit this crowd</h2>
          <div className="mt-4 grid gap-4">
            {data.matches.map((match) => {
              const home = countries.find((country) => country.slug === match.homeCountry);
              const away = countries.find((country) => country.slug === match.awayCountry);
              return (
                <a
                  key={match.id}
                  href={`/${venueCityKey}/map?country=${match.homeCountry}&vsCountry=${match.awayCountry}`}
                  className="rounded-3xl border border-[#d8e3f5] bg-white px-4 py-4 text-[#0a1628] transition hover:bg-[#f8fbff] dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="text-2xl">{home?.flagEmoji ?? "🏁"}</span>
                    <span>{home?.name ?? match.homeCountry}</span>
                    <span className="text-[#0a1628]/40">vs</span>
                    <span className="text-2xl">{away?.flagEmoji ?? "🏁"}</span>
                    <span>{away?.name ?? match.awayCountry}</span>
                    <span className="ml-auto rounded-full border border-[#d8e3f5] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/70">
                      {match.stageLabel ?? formatMatchStage(match.stage)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-[#0a1628]/60 dark:text-white/60">
                    {new Date(match.startsAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "America/New_York"
                    })}
                    <span className="mx-2 text-[#0a1628]/30">·</span>
                    {match.stadiumName}, {match.city}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#0a1628]/75 dark:text-white/75">{match.note}</p>
                  <div className="mt-3 text-sm font-semibold text-[#0a1628] dark:text-white">Find watch spots →</div>
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
            <p className="mt-4 text-navy/72">{data.venue.supporterNotes}</p>
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
                <div className="mt-2 text-3xl font-semibold text-deep">{data.venue.approximateCapacity ?? "--"}</div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-mist">Capacity source</div>
                <div className="mt-2 text-lg font-semibold text-deep">{data.venue.capacityConfidence.replace(/_/g, " ")}</div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="text-xs text-mist">Reservation type</div>
                <div className="mt-2 text-lg font-semibold text-deep">{data.venue.reservationType.replace(/_/g, " ")}</div>
              </div>
            </div>
            {data.venue.acceptsReservations && (
              <div className="mt-5 flex flex-wrap gap-3">
                {data.venue.reservationUrl && (
                  <a
                    href={data.venue.reservationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#f4b942] px-4 py-2 text-sm font-semibold text-[#0a1628]"
                  >
                    Reserve a spot
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {data.venue.reservationPhone && (
                  <a
                    href={`tel:${data.venue.reservationPhone}`}
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
              {data.venue.venueTypes.map((type) => (
                <Badge key={type}>{toTitleCase(type.replace(/_/g, " "))}</Badge>
              ))}
              {data.venue.cuisineTags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
              <Badge>{data.venue.numberOfScreens} screens</Badge>
              {data.venue.hasProjector && <Badge>Projector</Badge>}
              {data.venue.hasOutdoorViewing && <Badge>Outdoor seating</Badge>}
              {data.venue.familyFriendly && <Badge>Family friendly</Badge>}
              {data.venue.standingRoomFriendly && <Badge>Standing-room friendly</Badge>}
              {data.venue.privateEventsAvailable && <Badge>Private events</Badge>}
            </div>
            <p className="mt-4 text-sm text-navy/72">{data.venue.matchdayNotes}</p>
          </section>

          <SingleVenueLeafletMap venue={rankedVenue} countries={countries} />

          <section className="surface p-6">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Best matches to watch here</div>
            <h2 className="mt-2 text-2xl font-semibold text-deep">Upcoming games tied to this venue</h2>
            <div className="mt-4 grid gap-4">
              {data.matches.map((match) => {
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

          <section className="surface p-6">
            <ReservationRequestForm venueName={data.venue.name} />
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
              {(data.venue.reservationPhone || data.venue.phone) && (
                <a
                  href={`tel:${data.venue.reservationPhone ?? data.venue.phone ?? ""}`}
                  className="rounded-2xl bg-white px-4 py-3 text-navy dark:bg-white/5 dark:text-white"
                >
                  Call
                </a>
              )}
              {data.venue.acceptsReservations && data.venue.reservationUrl && (
                <a
                  href={data.venue.reservationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-white px-4 py-3 text-navy dark:bg-white/5 dark:text-white"
                >
                  Reserve
                </a>
              )}
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
}
