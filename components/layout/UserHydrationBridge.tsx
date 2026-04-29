"use client";

import { useEffect } from "react";

import { useSession } from "@/lib/hooks/useSession";
import { useFavoritesHydration } from "@/lib/store/favorites";
import { useMembershipHydration } from "@/lib/store/membership";
import { useMembership } from "@/lib/store/membership";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useUser, useUserHydration, useUserStore } from "@/lib/store/user";

async function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: { retries?: number; retryDelayMs?: number }
) {
  const retries = options?.retries ?? 5;
  const retryDelayMs = options?.retryDelayMs ?? 400;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const response = await fetch(input, init);

    if (response.ok) {
      return response.json();
    }

    if (response.status !== 401 || attempt === retries - 1) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    await wait(retryDelayMs);
  }

  throw new Error("Request failed");
}

function readPersistedMigrationSnapshot() {
  try {
    const persistedUserRaw = window.localStorage.getItem("gameday-user");
    const persistedFavoritesRaw = window.localStorage.getItem("gameday-favorites");

    const persistedUser = persistedUserRaw ? JSON.parse(persistedUserRaw) : null;
    const persistedFavorites = persistedFavoritesRaw ? JSON.parse(persistedFavoritesRaw) : null;

    return {
      profile: persistedUser?.state?.profile ?? null,
      favorites: Array.isArray(persistedFavorites?.state?.favorites) ? persistedFavorites.state.favorites : []
    };
  } catch {
    return {
      profile: null,
      favorites: []
    };
  }
}

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

    const persistedSnapshot = readPersistedMigrationSnapshot();
    const sourceProfile = persistedSnapshot.profile ?? localUser;
    const sourceFavorites = persistedSnapshot.favorites.length ? persistedSnapshot.favorites : favorites;
    const watchedMatches = (sourceProfile.watchlistMatchIds ?? []).map((matchId: string) => ({
      matchId,
      watchVenueSlug: sourceProfile.watchVenues?.[matchId] ?? null
    }));

    const hasLocalState =
      sourceFavorites.length > 0 ||
      watchedMatches.length > 0 ||
      (sourceProfile.followingCountrySlugs?.length ?? 0) > 0 ||
      Boolean(sourceProfile.firstName) ||
      Boolean(sourceProfile.favoriteCountrySlug);

    if (!hasLocalState) {
      window.localStorage.setItem(migrationKey, "true");
      return;
    }

    void fetchJsonWithRetry(
      "/api/me/migrate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            displayName: sourceProfile.displayName,
            firstName: sourceProfile.firstName,
            avatarEmoji: sourceProfile.avatarEmoji,
            homeCity: sourceProfile.homeCity,
            favoriteCity: sourceProfile.favoriteCity,
            favoriteCountrySlug: sourceProfile.favoriteCountrySlug,
            language: sourceProfile.language,
            prefersDarkMode: sourceProfile.prefersDarkMode,
            defaultFilters: sourceProfile.defaultFilters,
            promoOptIns: sourceProfile.promoOptIns,
            welcomeSeenAt: sourceProfile.welcomeSeenAt ? new Date(sourceProfile.welcomeSeenAt).toISOString() : null
          },
          followedCountries: sourceProfile.followingCountrySlugs ?? [],
          favoriteVenues: sourceFavorites,
          watchedMatches
        })
      },
      {
        retries: 6,
        retryDelayMs: 500
      }
    )
      .then((data) => {
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
