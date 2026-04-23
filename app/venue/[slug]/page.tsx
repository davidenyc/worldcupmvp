import Link from "next/link";
import { ExternalLink, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import { NycMapPanel } from "@/components/map/nyc-map-panel";
import { ReportUpdateForm } from "@/components/venue/report-update-form";
import { ReservationRequestForm } from "@/components/venue/reservation-request-form";
import { VenueHero } from "@/components/venue/venue-hero";
import { VenueCard } from "@/components/venue/venue-card";
import { Badge } from "@/components/ui/badge";
import { getVenueDetails } from "@/lib/data/repository";

export default async function VenuePage({
  params
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const data = await getVenueDetails(slug);

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

  return (
    <div>
      <VenueHero venue={rankedVenue} />
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
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
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
                <Badge key={type}>{type.replace(/_/g, " ")}</Badge>
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

          <NycMapPanel venues={[rankedVenue]} title="Single venue map" height="h-[380px]" />

          <section className="surface p-6">
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Best matches to watch here</div>
            <h2 className="mt-2 text-2xl font-semibold text-deep">Upcoming games tied to this venue</h2>
            <div className="mt-4 grid gap-4">
              {data.matches.map((match) => (
                <div key={match.id} className="rounded-2xl bg-white p-4">
                  <div className="font-semibold text-deep">
                    {match.homeCountry} vs {match.awayCountry}
                  </div>
                  <div className="mt-2 text-sm text-navy/65">
                    {new Date(match.startsAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}{" "}
                    · {match.competition}
                  </div>
                  <p className="mt-2 text-sm text-navy/72">{match.note}</p>
                </div>
              ))}
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
              {data.venue.website && (
                <a href={data.venue.website} className="rounded-2xl bg-white px-4 py-3 text-navy">
                  Website
                </a>
              )}
              {data.venue.instagramUrl && (
                <a href={data.venue.instagramUrl} className="rounded-2xl bg-white px-4 py-3 text-navy">
                  Instagram
                </a>
              )}
              <a
                href={`https://maps.apple.com/?q=${encodeURIComponent(data.venue.address)}`}
                className="rounded-2xl bg-white px-4 py-3 text-navy"
              >
                Directions
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
