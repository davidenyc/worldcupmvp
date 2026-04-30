"use client";

import Image from "next/image";
import Link from "next/link";

import { trackFeaturedVenueCtaClick } from "@/lib/analytics/track";

type FeaturedVenue = {
  slug: string;
  name: string;
  neighborhood: string;
  imageUrl: string;
  rating?: number;
  goingCount: number;
  acceptsReservations: boolean;
};

interface FeaturedVenuesForMatchProps {
  cityKey: string;
  countryLabel: string;
  countrySlug: string;
  totalVenueCount: number;
  venues: FeaturedVenue[];
  matchId: string;
}

export function FeaturedVenuesForMatch({
  cityKey,
  countryLabel,
  countrySlug,
  totalVenueCount,
  venues,
  matchId
}: FeaturedVenuesForMatchProps) {
  if (!venues.length) {
    return null;
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-mist">Featured tonight</div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-deep">
            Where {countryLabel} fans are gathering
          </h2>
        </div>
        <Link
          href={`/${cityKey}/map?match=${matchId}&country=${countrySlug}`}
          className="text-sm font-semibold text-[color:var(--fg-primary)]"
        >
          All {totalVenueCount} spots →
        </Link>
      </div>
      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {venues.map((venue) => (
          <Link
            key={venue.slug}
            href={`/venue/${venue.slug}`}
            onClick={() => trackFeaturedVenueCtaClick({ venueSlug: venue.slug, matchId, cityKey })}
            className="surface min-w-[17.5rem] max-w-[17.5rem] overflow-hidden p-0 transition hover:-translate-y-0.5 sm:min-w-[20rem] sm:max-w-[20rem]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={venue.imageUrl}
                alt={venue.name}
                fill
                sizes="(max-width: 640px) 280px, 320px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[color:var(--bg-deep)]/85 to-transparent" />
            </div>
            <div className="space-y-3 p-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-deep">{venue.name}</h3>
                <p className="mt-1 text-sm text-[color:var(--fg-secondary)]">{venue.neighborhood}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-[color:var(--fg-secondary)]">
                {venue.rating ? <span>★ {venue.rating.toFixed(1)}</span> : null}
                {venue.rating ? <span>·</span> : null}
                <span>{venue.goingCount}+ going</span>
              </div>
              <div className="inline-flex h-11 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)]">
                {venue.acceptsReservations ? "Reserve a spot →" : "Get there →"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
