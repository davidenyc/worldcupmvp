"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RankedVenue } from "@/lib/types";

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
  title = "NYC venue map",
  height = "h-[520px]"
}: {
  venues: RankedVenue[];
  title?: string;
  height?: string;
}) {
  const clusters = useMemo(() => clusterVenues(venues), [venues]);
  const [activeVenue, setActiveVenue] = useState<RankedVenue | null>(venues[0] ?? null);

  return (
    <div className="surface-strong p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-mist">NYC venue map</div>
          <h3 className="text-2xl font-semibold text-deep">{title}</h3>
        </div>
        <Badge>{venues.length} venues</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div
          className={`relative overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,#eef8ff_0%,#dff2ff_42%,#f8fcff_100%)] ${height}`}
        >
          <div className="absolute inset-0 bg-pitch-grid bg-[length:26px_26px] opacity-40" />
          <div className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-navy shadow-sm">
            New York City
          </div>
          <div className="absolute bottom-6 left-6 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-xs text-navy/70 shadow-sm">
            2D map abstraction with marker clustering
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
            <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
              <div className="flex items-center gap-2">
                <Badge>{activeVenue.venueTypes[0].replace(/_/g, " ")}</Badge>
                {activeVenue.acceptsReservations && <Badge className="bg-accent/15 text-accent">Reserve</Badge>}
              </div>
              <h4 className="mt-3 text-xl font-semibold text-deep">{activeVenue.name}</h4>
              <div className="mt-2 text-sm text-navy/70">
                {activeVenue.neighborhood}, {activeVenue.borough}
              </div>
              <p className="mt-3 text-sm leading-6 text-navy/75">{activeVenue.supporterNotes}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{activeVenue.approximateCapacity ?? "?"} cap.</Badge>
                <Badge>{activeVenue.numberOfScreens} screens</Badge>
                <Badge>{activeVenue.gameDayScore.toFixed(1)} vibe</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(activeVenue.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line bg-sky/50 px-3 py-2 text-sm font-medium text-navy"
                >
                  Directions
                </a>
                {activeVenue.acceptsReservations && (
                  <a
                    href={activeVenue.reservationUrl ?? `tel:${activeVenue.reservationPhone ?? ""}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-accent px-3 py-2 text-sm font-medium text-white"
                  >
                    Reserve
                  </a>
                )}
                <Link
                  href={`/venue/${activeVenue.slug}`}
                  className="rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-navy"
                >
                  View venue
                </Link>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {venues.slice(0, 8).map((venue) => (
              <button
                key={venue.id}
                type="button"
                onClick={() => setActiveVenue(venue)}
                className="block w-full rounded-2xl border border-white/80 bg-white px-4 py-4 text-left shadow-sm transition hover:bg-sky/35"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-deep">{venue.name}</div>
                    <div className="mt-1 text-sm text-navy/65">
                      {venue.neighborhood}, {venue.borough}
                    </div>
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
