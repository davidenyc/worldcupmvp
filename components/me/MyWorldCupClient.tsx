// Client hub for the /me route that assembles personalized sections from local stores.
"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { MyActivityTimeline } from "@/components/me/MyActivityTimeline";
import { MyFollowing } from "@/components/me/MyFollowing";
import { MyHeroIdentity } from "@/components/me/MyHeroIdentity";
import { MyQRCodes } from "@/components/me/MyQRCodes";
import { MySavedVenues } from "@/components/me/MySavedVenues";
import { MyWatchlist } from "@/components/me/MyWatchlist";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useGroups } from "@/lib/store/groups";
import { useMembership } from "@/lib/store/membership";
import { useSavedPromosStore } from "@/lib/store/savedPromos";
import { useUser } from "@/lib/store/user";
import { useWatchlistStore } from "@/lib/store/watchlist";
import type { Promo } from "@/lib/data/promos";
import type { WorldCupMatch } from "@/lib/data/matches";
import type { RankedVenue } from "@/lib/types";

export function MyWorldCupClient({
  venues,
  matches,
  promos
}: {
  venues: RankedVenue[];
  matches: WorldCupMatch[];
  promos: Promo[];
}) {
  const user = useUser();
  const tier = useMembership((state) => state.tier);
  const favorites = useFavoritesStore((state) => state.favorites);
  const groups = useGroups((state) => state.groups);
  const watchedMatches = useWatchlistStore((state) => state.watchedMatches);
  const watchVenues = useWatchlistStore((state) => state.watchVenues);
  const savedPromos = useSavedPromosStore((state) => state.savedPromos);

  const savedVenueList = venues.filter((venue) => favorites.includes(venue.slug));
  const watchedMatchList = matches.filter((match) => watchedMatches.includes(match.id));

  if (!user.favoriteCountrySlug) {
    return (
      <div className="space-y-6">
        <EmptyState
          emoji="🏆"
          title="Personalize your Cup"
          subtitle="Pick your country, city, and match-day preferences so My Cup can actually feel like yours."
          action={
            <Link href="/welcome" className="inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep">
              Personalize your Cup →
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MyHeroIdentity user={user} tier={tier} />
      <MyFollowing
        favoriteCountry={user.favoriteCountrySlug}
        followedCountries={user.followingCountrySlugs}
        favoriteCity={user.homeCity ?? user.favoriteCity}
      />
      <MySavedVenues venues={savedVenueList} cityKey={user.homeCity ?? user.favoriteCity} />
      <MyWatchlist matches={watchedMatchList} watchVenues={watchVenues} cityKey={user.homeCity ?? user.favoriteCity} />
      <MyQRCodes savedPromos={savedPromos} promos={promos} venues={venues} />
      <MyActivityTimeline activity={user.activity} />

      <section className="surface p-6">
        <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Preferences</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Default match-day setup</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {user.defaultFilters.soundOn ? <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface-2 px-4 text-sm font-semibold text-deep">Sound on</span> : null}
          {user.defaultFilters.reservationsPossible ? <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface-2 px-4 text-sm font-semibold text-deep">Reservations</span> : null}
          {user.defaultFilters.outdoorSeating ? <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface-2 px-4 text-sm font-semibold text-deep">Outdoor</span> : null}
          {!user.defaultFilters.soundOn && !user.defaultFilters.reservationsPossible && !user.defaultFilters.outdoorSeating ? (
            <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm text-mist">No default filters yet</span>
          ) : null}
        </div>
        <div className="mt-4 text-sm text-mist">
          Promo email: {user.promoOptIns.email ? "On" : "Off"} · Match alerts: {user.promoOptIns.push ? "On" : "Off"} · <Link href="/account" className="font-semibold text-deep">Edit in Account</Link>
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Watch parties</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Your groups</h2>
          </div>
          <Link href="/groups" className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2">
            Open groups →
          </Link>
        </div>

        <div className="mt-5">
          {groups.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {groups.map((group) => (
                <Link key={group.id} href="/groups" className="rounded-2xl border border-line bg-surface-2 p-4 transition hover:border-line-strong">
                  <div className="text-base font-semibold text-deep">{group.name}</div>
                  <div className="mt-1 text-sm text-mist">{group.venueName}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.16em] text-mist">
                    {group.memberCount} members · {new Date(group.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="👥"
              title="No watch parties yet"
              subtitle="Create or join a group so your crew has one place to lock the match plan."
              action={
                <Link href="/groups" className="inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep">
                  Create a group →
                </Link>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
