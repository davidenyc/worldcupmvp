"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock3, ExternalLink, Instagram, MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RankedVenue } from "@/lib/types";
import { getVenueTvLabel } from "@/lib/utils";
import { getVenueImageSet } from "@/lib/utils/venueImages";

type Cluster = {
  id: string;
  x: number;
  y: number;
  venues: RankedVenue[];
};

const bounds = {
  minLat: 40.56,
  maxLat: 40.92,
  minLng: -74.21,
  maxLng: -73.69
};

function project(lat: number, lng: number) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
  return { x, y };
}

function clusterVenues(venues: RankedVenue[]) {
  const clusters: Cluster[] = [];

  venues.forEach((venue) => {
    const point = project(venue.lat, venue.lng);
    const existing = clusters.find((cluster) => {
      const dx = cluster.x - point.x;
      const dy = cluster.y - point.y;
      return Math.sqrt(dx * dx + dy * dy) < 6.5;
    });

    if (existing) {
      existing.venues.push(venue);
      existing.x = (existing.x * (existing.venues.length - 1) + point.x) / existing.venues.length;
      existing.y = (existing.y * (existing.venues.length - 1) + point.y) / existing.venues.length;
    } else {
      clusters.push({
        id: venue.id,
        x: point.x,
        y: point.y,
        venues: [venue]
      });
    }
  });

  return clusters;
}

export function NycMapPanel({
  venues,
  title = "USA host-city venue map",
  height = "h-[520px]"
}: {
  venues: RankedVenue[];
  title?: string;
  height?: string;
}) {
  const clusters = useMemo(() => clusterVenues(venues), [venues]);
  const [activeVenue, setActiveVenue] = useState<RankedVenue | null>(venues[0] ?? null);
  const activeVenueImages = activeVenue ? getVenueImageSet(activeVenue) : [];
  const tvLabel = activeVenue ? getVenueTvLabel(activeVenue) : null;

  return (
    <div className="surface-strong p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-mist dark:text-white/45">Host-city venue map</div>
          <h3 className="text-2xl font-semibold text-deep dark:text-white">{title}</h3>
        </div>
        <Badge className="dark:bg-white/10 dark:text-white">{venues.length} venues</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div
          className={`relative overflow-hidden rounded-[30px] border border-line bg-[color:color-mix(in_srgb,var(--bg-surface-elevated)_92%,white)] dark:border-line dark:bg-[var(--bg-surface-strong)] ${height}`}
        >
          <div className="absolute inset-0 bg-pitch-grid bg-[length:26px_26px] opacity-40" />
          <div className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-navy shadow-sm dark:bg-white/10 dark:text-white">
            Host city
          </div>
          <div className="absolute bottom-6 left-6 rounded-2xl border border-line bg-[color:color-mix(in_srgb,var(--bg-surface)_80%,transparent)] px-4 py-3 text-xs text-[color:var(--fg-secondary)] shadow-sm dark:border-line dark:bg-[color:color-mix(in_srgb,var(--bg-surface-strong)_90%,transparent)] dark:text-[color:var(--fg-secondary-on-strong)]">
            Map view with venue clustering
          </div>

          {clusters.map((cluster) => {
            const single = cluster.venues.length === 1 ? cluster.venues[0] : null;

            return (
              <button
                key={cluster.id}
                type="button"
                onClick={() => setActiveVenue(single ?? cluster.venues[0])}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition hover:scale-105 ${
                  cluster.venues.length > 1
                    ? "h-10 w-10 border-accent bg-accent text-white"
                    : "h-8 w-8 border-white bg-deep text-white"
                }`}
                style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}
                aria-label={
                  cluster.venues.length > 1
                    ? `${cluster.venues.length} venues in cluster`
                    : cluster.venues[0].name
                }
              >
                {cluster.venues.length > 1 ? cluster.venues.length : <MapPin className="h-4 w-4" />}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {activeVenue && (
            <div className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-card dark:border-line dark:bg-[var(--bg-surface-strong)]">
              <div className="relative h-44">
                <Image
                  src={activeVenueImages[0]}
                  alt={activeVenue.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[color:color-mix(in_srgb,var(--bg-deep)_70%,transparent)] via-[color:color-mix(in_srgb,var(--bg-deep)_20%,transparent)] to-transparent" />
              </div>
              <div className="p-5">
              <div className="flex items-center gap-2">
                {activeVenue.venueTypes[0] ? (
                  <Badge className="dark:border-white/15 dark:bg-white/8 dark:text-white">
                    {activeVenue.venueTypes[0].replace(/_/g, " ")}
                  </Badge>
                ) : null}
                {activeVenue.acceptsReservations && <Badge className="bg-accent/15 text-accent dark:bg-gold/25 dark:text-gold">Reserve</Badge>}
              </div>
              <h4 className="mt-3 text-xl font-semibold text-deep dark:text-white">{activeVenue.name}</h4>
              <div className="mt-2 text-sm text-navy/70 dark:text-white/70">
                {activeVenue.neighborhood}
              </div>
              <p className="mt-3 text-sm leading-6 text-navy/75 dark:text-white/75">{activeVenue.supporterNotes}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="dark:border-white/15 dark:bg-white/8 dark:text-white">{activeVenue.approximateCapacity ?? "?"} cap.</Badge>
                {tvLabel ? <Badge className="dark:border-white/15 dark:bg-white/8 dark:text-white">{tvLabel}</Badge> : null}
                <Badge className="dark:border-white/15 dark:bg-white/8 dark:text-white">{activeVenue.gameDayScore.toFixed(1)} vibe</Badge>
                <Badge className={`${activeVenue.openNow ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "dark:border-white/15 dark:bg-white/8 dark:text-white"}`}>
                  <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                  {activeVenue.openNow ? "Open now" : "Hours vary"}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(activeVenue.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line bg-sky/50 px-3 py-2 text-sm font-medium text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  Directions
                </a>
                {activeVenue.acceptsReservations && (activeVenue.reservationUrl || activeVenue.reservationPhone) && (
                  <a
                    href={activeVenue.reservationUrl ?? `tel:${activeVenue.reservationPhone!}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-accent px-3 py-2 text-sm font-medium text-[color:var(--fg-on-accent)]"
                  >
                    Reserve
                  </a>
                )}
                {activeVenue.website && (
                  <a
                    href={activeVenue.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </a>
                )}
                {activeVenue.instagramUrl && (
                  <a
                    href={activeVenue.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <Instagram className="h-4 w-4" />
                    Insta
                  </a>
                )}
                {(activeVenue.reservationPhone || activeVenue.phone) && (
                  <a
                    href={`tel:${activeVenue.reservationPhone ?? activeVenue.phone ?? ""}`}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
                <Link
                  href={`/venue/${activeVenue.slug}`}
                  className="rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-navy dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  View venue
                </Link>
              </div>
            </div>
            </div>
          )}
          <div className="space-y-3">
            {venues.slice(0, 8).map((venue) => (
              <button
                key={venue.id}
                type="button"
                onClick={() => setActiveVenue(venue)}
                className="block w-full rounded-2xl border border-line bg-surface px-4 py-4 text-left shadow-sm transition hover:bg-surface-2 dark:border-line dark:bg-[var(--bg-surface-strong)] dark:hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-deep dark:text-white">{venue.name}</div>
                    <div className="mt-1 text-sm text-navy/65 dark:text-white/65">{venue.neighborhood}</div>
                  </div>
                  {venue.reservationPhone && <Phone className="h-4 w-4 text-accent" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
