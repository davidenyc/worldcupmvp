"use client";

import { useMemo } from "react";

import { VenueCard } from "@/components/venue/venue-card";
import { useFavoritesStore } from "@/lib/store/favorites";
import { RankedVenue } from "@/lib/types";

export function RankedVenueList({
  venues,
  title,
  subtitle
}: {
  venues: RankedVenue[];
  title: string;
  subtitle?: string;
}) {
  const favorites = useFavoritesStore((state) => state.favorites);

  const sorted = useMemo(() => {
    return [...venues].sort((a, b) => {
      const aFav = favorites.includes(a.slug) ? 1 : 0;
      const bFav = favorites.includes(b.slug) ? 1 : 0;
      return bFav - aFav || b.rankScore - a.rankScore;
    });
  }, [favorites, venues]);

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">{title}</div>
          {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-navy/72">{subtitle}</p>}
        </div>
        <div className="rounded-full bg-sky/60 px-3 py-1 text-xs font-semibold text-navy">
          {favorites.length ? `${favorites.length} saved` : "Tap Save on any card"}
        </div>
      </div>
      <div className="mt-4 grid gap-4">
        {sorted.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </section>
  );
}
