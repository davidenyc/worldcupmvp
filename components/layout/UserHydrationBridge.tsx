"use client";

import { useEffect } from "react";

import { useSession } from "@/lib/hooks/useSession";
import { useFavoritesHydration } from "@/lib/store/favorites";
import { useMembershipHydration } from "@/lib/store/membership";
import { useMembership } from "@/lib/store/membership";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useUser, useUserHydration, useUserStore } from "@/lib/store/user";

// Global client bridge that hydrates the user store from Supabase after auth state resolves.
export function UserHydrationBridge() {
  const { user: authUser, loading } = useSession();
  const localUser = useUser();
  const hydrateUser = useUserStore((state) => state.hydrateFromServer);
  const hydrateFavorites = useFavoritesStore((state) => state.hydrateFavorites);
  const hydrateMembership = useMembership((state) => state.hydrateMembership);
  const favorites = useFavoritesStore((state) => state.favorites);

  useUserHydration();
  useFavoritesHydration();
  useMembershipHydration();

  useEffect(() => {
    if (loading || !authUser) return;

    const migrationKey = `gameday-auth-migrated:${authUser.id}`;
    if (window.localStorage.getItem(migrationKey) === "true") return;

    const watchedMatches = localUser.watchlistMatchIds.map((matchId) => ({
      matchId,
      watchVenueSlug: localUser.watchVenues[matchId] ?? null
    }));

    const hasLocalState =
      favorites.length > 0 ||
      watchedMatches.length > 0 ||
      localUser.followingCountrySlugs.length > 0 ||
      Boolean(localUser.firstName) ||
      Boolean(localUser.favoriteCountrySlug);

    if (!hasLocalState) {
      window.localStorage.setItem(migrationKey, "true");
      return;
    }

    void fetch("/api/me/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: {
          displayName: localUser.displayName,
          firstName: localUser.firstName,
          avatarEmoji: localUser.avatarEmoji,
          homeCity: localUser.homeCity,
          favoriteCity: localUser.favoriteCity,
          favoriteCountrySlug: localUser.favoriteCountrySlug,
          language: localUser.language,
          prefersDarkMode: localUser.prefersDarkMode,
          defaultFilters: localUser.defaultFilters,
          promoOptIns: localUser.promoOptIns,
          welcomeSeenAt: localUser.welcomeSeenAt ? new Date(localUser.welcomeSeenAt).toISOString() : null
        },
        followedCountries: localUser.followingCountrySlugs,
        favoriteVenues: favorites,
        watchedMatches
      })
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Migration failed");
        }

        const data = await response.json();
        const favoriteCountrySlug = data.profile?.favoriteCountrySlug ?? undefined;
        const followedCountries = (data.followedCountries ?? []) as string[];
        const nextWatchedMatches = (data.watchedMatches ?? []) as Array<{ matchId: string; watchVenueSlug?: string | null }>;

        hydrateUser({
          id: authUser.id,
          email: data.authEmail ?? authUser.email ?? "",
          displayName: data.profile?.displayName ?? authUser.email ?? "Fan",
          firstName: data.profile?.firstName ?? undefined,
          avatarEmoji: data.profile?.avatarEmoji ?? undefined,
          homeCity: data.profile?.homeCity ?? undefined,
          favoriteCity: data.profile?.favoriteCity ?? "nyc",
          favoriteCountrySlug,
          followingCountrySlugs: followedCountries,
          followedCountries,
          favoriteCountries: favoriteCountrySlug
            ? [favoriteCountrySlug, ...followedCountries.filter((entry) => entry !== favoriteCountrySlug)]
            : followedCountries,
          language: data.profile?.language ?? "en",
          prefersDarkMode: data.profile?.prefersDarkMode ?? false,
          defaultFilters: data.profile?.defaultFilters ?? localUser.defaultFilters,
          promoOptIns: data.profile?.promoOptIns ?? localUser.promoOptIns,
          welcomeSeenAt: data.profile?.welcomeSeenAt ? new Date(data.profile.welcomeSeenAt).getTime() : undefined,
          watchlistMatchIds: nextWatchedMatches.map((entry) => entry.matchId),
          watchVenues: Object.fromEntries(
            nextWatchedMatches
              .filter((entry) => entry.watchVenueSlug)
              .map((entry) => [entry.matchId, entry.watchVenueSlug ?? null])
          )
        });
        hydrateFavorites(data.favoriteVenues ?? []);
        hydrateMembership({
          tier: data.membership?.tier ?? "free",
          upgradedAt: data.membership?.upgradedAt ?? null
        });
        window.localStorage.setItem(migrationKey, "true");
      })
      .catch(() => {});
  }, [
    authUser,
    favorites,
    hydrateFavorites,
    hydrateMembership,
    hydrateUser,
    loading,
    localUser
  ]);

  return null;
}
