"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useSession } from "@/lib/hooks/useSession";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  favoriteCity: string;
  firstName?: string;
  homeCity?: string;
  favoriteCountrySlug?: string;
  followingCountrySlugs: string[];
  favoriteCountries: string[];
  followedCountries: string[];
  defaultFilters: {
    soundOn: boolean;
    reservationsPossible: boolean;
    outdoorSeating: boolean;
  };
  promoOptIns: {
    email: boolean;
    push: boolean;
  };
  welcomeSeenAt?: number;
  watchlistMatchIds: string[];
  watchStatuses: Record<string, WatchStatus>;
  watchVenues: Record<string, string | null>;
  watchRatings: Record<string, number | null>;
  activity: UserActivityEntry[];
  language: string;
  prefersDarkMode: boolean;
  notifyMatchAlerts: boolean;
  notifyNewVenues: boolean;
  avatarEmoji: string;
  joinedAt: string;
  seenInstallPrompt: boolean;
  dismissedInstallBanner: boolean;
  emailSubscribed: boolean;
}

export type WatchStatus = "planned" | "watched";

export interface UserActivityEntry {
  at: number;
  kind: string;
  label: string;
  href?: string;
  payload?: Record<string, unknown>;
}

export type UserStore = {
  profile: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  ensureUser: () => void;
  resetUser: () => void;
  toggleWatchlistMatch: (matchId: string) => void;
  planWatchMatch: (matchId: string, venueSlug?: string | null) => void;
  markWatchedMatch: (
    matchId: string,
    options?: { venueSlug?: string | null; rating?: number | null }
  ) => void;
  setWatchVenue: (matchId: string, venueSlug: string | null) => void;
  clearWatchVenue: (matchId: string) => void;
  appendActivity: (entry: Omit<UserActivityEntry, "at"> & { at?: number }) => void;
  clearActivity: () => void;
  setFirstName: (firstName?: string) => void;
  setHomeCity: (homeCity?: string) => void;
  setFavoriteCountry: (favoriteCountrySlug?: string) => void;
  setFollowing: (followingCountrySlugs: string[]) => void;
  setDefaultFilters: (filters: Partial<UserProfile["defaultFilters"]>) => void;
  setPromoOptIns: (optIns: Partial<UserProfile["promoOptIns"]>) => void;
  markWelcomeSeen: (at?: number) => void;
  resetOnboarding: () => void;
  hydrateFromServer: (payload: Partial<UserProfile>) => void;
};

let activeAuthUser: { id: string; email: string } | null = null;

function setActiveAuthUser(nextUser: { id: string; email: string } | null) {
  activeAuthUser = nextUser;
}

function createIdentity() {
  return {
    id: crypto.randomUUID(),
    joinedAt: new Date().toISOString()
  };
}

function createDefaultProfile(): UserProfile {
  return {
    ...createIdentity(),
    displayName: "Fan",
    email: "",
    favoriteCity: "nyc",
    firstName: undefined,
    homeCity: undefined,
    favoriteCountrySlug: undefined,
    followingCountrySlugs: [],
    favoriteCountries: [],
    followedCountries: [],
    defaultFilters: {
      soundOn: false,
      reservationsPossible: false,
      outdoorSeating: false
    },
    promoOptIns: {
      email: false,
      push: false
    },
    welcomeSeenAt: undefined,
    watchlistMatchIds: [],
    watchStatuses: {},
    watchVenues: {},
    watchRatings: {},
    activity: [],
    language: "en",
    prefersDarkMode: false,
    notifyMatchAlerts: false,
    notifyNewVenues: false,
    avatarEmoji: "⚽",
    seenInstallPrompt: false,
    dismissedInstallBanner: false,
    emailSubscribed: false
  };
}

function normalizeProfile(profile: Partial<UserProfile>): UserProfile {
  const favoriteCountries = profile.favoriteCountries ?? profile.followedCountries ?? [];
  const followedCountries = profile.followedCountries ?? profile.followingCountrySlugs ?? profile.favoriteCountries ?? [];
  const followingCountrySlugs = profile.followingCountrySlugs ?? followedCountries;
  const favoriteCountrySlug = profile.favoriteCountrySlug ?? favoriteCountries[0];

  return {
    ...createDefaultProfile(),
    ...profile,
    firstName: profile.firstName?.trim() || undefined,
    homeCity: profile.homeCity ?? profile.favoriteCity ?? undefined,
    favoriteCountrySlug,
    followingCountrySlugs,
    favoriteCountries,
    followedCountries,
    defaultFilters: {
      ...createDefaultProfile().defaultFilters,
      ...profile.defaultFilters
    },
    promoOptIns: {
      ...createDefaultProfile().promoOptIns,
      ...profile.promoOptIns
    },
    watchlistMatchIds: profile.watchlistMatchIds ?? [],
    watchStatuses: profile.watchStatuses ?? {},
    watchVenues: profile.watchVenues ?? {},
    watchRatings: profile.watchRatings ?? {},
    activity: profile.activity ?? []
  };
}

function appendActivityEntry(
  profile: UserProfile,
  entry: Omit<UserActivityEntry, "at"> & { at?: number }
) {
  return normalizeProfile({
    ...profile,
    activity: [{ ...entry, at: entry.at ?? Date.now() }, ...profile.activity]
      .sort((a, b) => b.at - a.at)
      .slice(0, 25)
  });
}

function buildServerProfilePatch(updates: Partial<UserProfile>) {
  const patch: Record<string, unknown> = {};

  if ("displayName" in updates) patch.displayName = updates.displayName ?? null;
  if ("firstName" in updates) patch.firstName = updates.firstName ?? null;
  if ("avatarEmoji" in updates) patch.avatarEmoji = updates.avatarEmoji ?? null;
  if ("homeCity" in updates) patch.homeCity = updates.homeCity ?? null;
  if ("favoriteCity" in updates) patch.favoriteCity = updates.favoriteCity;
  if ("favoriteCountrySlug" in updates) patch.favoriteCountrySlug = updates.favoriteCountrySlug ?? null;
  if ("language" in updates) patch.language = updates.language;
  if ("prefersDarkMode" in updates) patch.prefersDarkMode = updates.prefersDarkMode;
  if ("defaultFilters" in updates) patch.defaultFilters = updates.defaultFilters;
  if ("promoOptIns" in updates) patch.promoOptIns = updates.promoOptIns;
  if ("welcomeSeenAt" in updates) {
    patch.welcomeSeenAt = updates.welcomeSeenAt ? new Date(updates.welcomeSeenAt).toISOString() : null;
  }

  const followedCountries =
    updates.followingCountrySlugs ?? updates.followedCountries ?? updates.favoriteCountries;

  if (followedCountries) {
    patch.followedCountries = followedCountries;
  }

  return patch;
}

function syncUserProfileToServer(updates: Partial<UserProfile>) {
  if (!activeAuthUser) return;

  const patch = buildServerProfilePatch(updates);
  if (!Object.keys(patch).length) return;

  void fetch("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
}

function syncWatchedMatchToServer(matchId: string, watchVenueSlug: string | null) {
  if (!activeAuthUser) return;

  void fetch(`/api/me/watched-matches/${matchId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ watchVenueSlug })
  });
}

function removeWatchedMatchFromServer(matchId: string) {
  if (!activeAuthUser) return;

  void fetch(`/api/me/watched-matches/${matchId}`, {
    method: "DELETE"
  });
}

function withoutKey<T>(record: Record<string, T>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

function formatVenueSlugLabel(value: string | null | undefined) {
  if (!value) return null;

  return value
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: createDefaultProfile(),
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      updateUser: (updates) => {
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            ...updates
          })
        }));
        syncUserProfileToServer(updates);
      },
      ensureUser: () => {
        const { profile } = get();
        if (profile.id) return;
        set({
          profile: normalizeProfile({
            ...createDefaultProfile(),
            ...profile,
            ...createIdentity()
          })
        });
      },
      // SRC: local-only — anonymous identity bootstrap stays client-side.
      resetUser: () =>
        set({
          profile: createDefaultProfile()
        }),
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      toggleWatchlistMatch: (matchId) =>
        set((state) => {
          const alreadyWatching = state.profile.watchlistMatchIds.includes(matchId);
          if (alreadyWatching) {
            removeWatchedMatchFromServer(matchId);

            return {
              profile: appendActivityEntry(normalizeProfile({
                ...state.profile,
                watchlistMatchIds: state.profile.watchlistMatchIds.filter((entry) => entry !== matchId),
                watchStatuses: withoutKey(state.profile.watchStatuses, matchId),
                watchVenues: withoutKey(state.profile.watchVenues, matchId),
                watchRatings: withoutKey(state.profile.watchRatings, matchId)
              }), {
                kind: "watchlist_removed",
                label: "Removed a match from My Cup watchlist.",
                href: "/matches"
              })
            };
          }

          syncWatchedMatchToServer(matchId, state.profile.watchVenues[matchId] ?? null);
          return {
            profile: appendActivityEntry(normalizeProfile({
                ...state.profile,
                watchlistMatchIds: [...state.profile.watchlistMatchIds, matchId],
                watchStatuses: {
                  ...state.profile.watchStatuses,
                  [matchId]: "planned"
                }
            }), {
              kind: "watchlist_added",
              label: "Added a match to My Cup watchlist.",
              href: "/matches"
            })
          };
        }),
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      planWatchMatch: (matchId, venueSlug = null) =>
        set((state) => {
          syncWatchedMatchToServer(matchId, venueSlug);

          return {
            profile: normalizeProfile({
              ...state.profile,
              watchlistMatchIds: state.profile.watchlistMatchIds.includes(matchId)
                ? state.profile.watchlistMatchIds
                : [...state.profile.watchlistMatchIds, matchId],
              watchStatuses: {
                ...state.profile.watchStatuses,
                [matchId]: "planned"
              },
              watchVenues: venueSlug === undefined
                ? state.profile.watchVenues
                : {
                    ...state.profile.watchVenues,
                    [matchId]: venueSlug
                  }
            })
          };
        }),
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      markWatchedMatch: (matchId, options) =>
        set((state) => {
          const nextVenueSlug = options?.venueSlug ?? state.profile.watchVenues[matchId] ?? null;
          const nextRating = options?.rating ?? state.profile.watchRatings[matchId] ?? null;
          const venueLabel = formatVenueSlugLabel(nextVenueSlug);

          syncWatchedMatchToServer(matchId, nextVenueSlug);

          return {
            profile: appendActivityEntry(
              normalizeProfile({
                ...state.profile,
                watchlistMatchIds: state.profile.watchlistMatchIds.includes(matchId)
                  ? state.profile.watchlistMatchIds
                  : [...state.profile.watchlistMatchIds, matchId],
                watchStatuses: {
                  ...state.profile.watchStatuses,
                  [matchId]: "watched"
                },
                watchVenues: {
                  ...state.profile.watchVenues,
                  [matchId]: nextVenueSlug
                },
                watchRatings: {
                  ...state.profile.watchRatings,
                  [matchId]: nextRating
                }
              }),
              {
                kind: "watched_match",
                label: venueLabel
                  ? `Checked into a watched match at ${venueLabel}.`
                  : "Checked into a watched match.",
                href: "/me",
                payload: {
                  matchId,
                  watchVenueSlug: nextVenueSlug,
                  rating: nextRating
                }
              }
            )
          };
        }),
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      setWatchVenue: (matchId, venueSlug) =>
        set((state) => {
          syncWatchedMatchToServer(matchId, venueSlug);
          return {
            profile: appendActivityEntry(normalizeProfile({
              ...state.profile,
              watchlistMatchIds: state.profile.watchlistMatchIds.includes(matchId)
                ? state.profile.watchlistMatchIds
                : [...state.profile.watchlistMatchIds, matchId],
              watchStatuses: {
                ...state.profile.watchStatuses,
                [matchId]: state.profile.watchStatuses[matchId] ?? "planned"
              },
              watchVenues: {
                ...state.profile.watchVenues,
                [matchId]: venueSlug
              }
            }), {
              kind: "watch_venue_set",
              label: venueSlug ? `Picked a venue for match ${matchId}.` : `Updated venue plan for match ${matchId}.`,
              href: "/me"
            })
          };
        }),
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      clearWatchVenue: (matchId) =>
        set((state) => {
          syncWatchedMatchToServer(matchId, null);
          return {
            profile: normalizeProfile({
              ...state.profile,
              watchVenues: withoutKey(state.profile.watchVenues, matchId)
            })
          };
        }),
      // SRC: local-only — server ActivityEvent sync is deferred.
      appendActivity: (entry) =>
        set((state) => ({
          profile: appendActivityEntry(state.profile, entry)
        })),
      // SRC: local-only — server ActivityEvent sync is deferred.
      clearActivity: () =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            activity: []
          })
        })),
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      setFirstName: (firstName) => {
        const trimmed = firstName?.trim() || undefined;
        const currentDisplayName = get().profile.displayName;
        get().updateUser({
          firstName: trimmed,
          displayName: trimmed || currentDisplayName
        });
      },
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      setHomeCity: (homeCity) => {
        get().updateUser({
          homeCity,
          favoriteCity: homeCity ?? get().profile.favoriteCity
        });
      },
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      setFavoriteCountry: (favoriteCountrySlug) => {
        const profile = get().profile;
        get().updateUser({
          favoriteCountrySlug,
          favoriteCountries: favoriteCountrySlug
            ? [favoriteCountrySlug, ...profile.favoriteCountries.filter((entry) => entry !== favoriteCountrySlug)]
            : [],
          followedCountries: favoriteCountrySlug
            ? [favoriteCountrySlug, ...profile.followedCountries.filter((entry) => entry !== favoriteCountrySlug)]
            : profile.followedCountries,
          followingCountrySlugs: favoriteCountrySlug
            ? [favoriteCountrySlug, ...profile.followingCountrySlugs.filter((entry) => entry !== favoriteCountrySlug)]
            : profile.followingCountrySlugs
        });
      },
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      setFollowing: (followingCountrySlugs) => {
        const favoriteCountrySlug = get().profile.favoriteCountrySlug;
        get().updateUser({
          followingCountrySlugs,
          followedCountries: followingCountrySlugs,
          favoriteCountries: favoriteCountrySlug
            ? [favoriteCountrySlug, ...followingCountrySlugs.filter((entry) => entry !== favoriteCountrySlug)]
            : followingCountrySlugs
        });
      },
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      setDefaultFilters: (filters) => {
        get().updateUser({
          defaultFilters: {
            ...get().profile.defaultFilters,
            ...filters
          }
        });
      },
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      setPromoOptIns: (optIns) => {
        get().updateUser({
          promoOptIns: {
            ...get().profile.promoOptIns,
            ...optIns
          }
        });
      },
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      markWelcomeSeen: (at = Date.now()) => {
        get().updateUser({
          welcomeSeenAt: at
        });
      },
      // SRC: hybrid — local optimistic cache, server-backed when authenticated.
      resetOnboarding: () => {
        get().updateUser({
          firstName: undefined,
          homeCity: undefined,
          favoriteCountrySlug: undefined,
          followingCountrySlugs: [],
          favoriteCountries: [],
          followedCountries: [],
          defaultFilters: createDefaultProfile().defaultFilters,
          promoOptIns: createDefaultProfile().promoOptIns,
          welcomeSeenAt: undefined,
          activity: [],
          watchlistMatchIds: [],
          watchStatuses: {},
          watchVenues: {},
          watchRatings: {}
        });
      },
      // SRC: hybrid — server-backed hydration with local cache fallback.
      hydrateFromServer: (payload) =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            ...payload
          })
        }))
    }),
    {
      name: "gameday-user",
      merge: (persistedState, currentState) => {
        const persistedProfile = (persistedState as Partial<UserStore> | undefined)?.profile;
        if (!persistedProfile) return currentState;

        return {
          ...currentState,
          ...(persistedState as object),
          profile: normalizeProfile(persistedProfile)
        } satisfies UserStore;
      }
    }
  )
);

export function useUser() {
  const profile = useUserStore((state) => state.profile);
  const ensureUser = useUserStore((state) => state.ensureUser);

  useEffect(() => {
    ensureUser();
  }, [ensureUser]);

  return profile;
}

export function useUpdateUser() {
  return useUserStore((state) => state.updateUser);
}

export function useResetUser() {
  return useUserStore((state) => state.resetUser);
}

export function useAppendActivity() {
  return useUserStore((state) => state.appendActivity);
}

export function useOnboardingActions() {
  return useUserStore((state) => ({
    setFirstName: state.setFirstName,
    setHomeCity: state.setHomeCity,
    setFavoriteCountry: state.setFavoriteCountry,
    setFollowing: state.setFollowing,
    setDefaultFilters: state.setDefaultFilters,
    setPromoOptIns: state.setPromoOptIns,
    markWelcomeSeen: state.markWelcomeSeen,
    resetOnboarding: state.resetOnboarding
  }));
}

export function useUserHydration() {
  const { user, loading } = useSession();
  const hydrateFromServer = useUserStore((state) => state.hydrateFromServer);
  const ensureUser = useUserStore((state) => state.ensureUser);
  const resetUser = useUserStore((state) => state.resetUser);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setActiveAuthUser(null);
      resetUser();
      ensureUser();
      return;
    }

    setActiveAuthUser({
      id: user.id,
      email: user.email ?? ""
    });

    void fetch("/api/me")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to hydrate user");
        }

        const data = await response.json();
        const favoriteCountrySlug = data.profile?.favoriteCountrySlug ?? undefined;
        const followedCountries = (data.followedCountries ?? []) as string[];
        const watchedMatches = (data.watchedMatches ?? []) as Array<{ matchId: string; watchVenueSlug?: string | null }>;
        const localProfile = useUserStore.getState().profile;

        hydrateFromServer({
          id: user.id,
          email: data.authEmail ?? user.email ?? "",
          displayName: data.profile?.displayName ?? user.user_metadata?.name ?? "Fan",
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
          defaultFilters: data.profile?.defaultFilters ?? createDefaultProfile().defaultFilters,
          promoOptIns: data.profile?.promoOptIns ?? createDefaultProfile().promoOptIns,
          welcomeSeenAt: data.profile?.welcomeSeenAt ? new Date(data.profile.welcomeSeenAt).getTime() : undefined,
          joinedAt: data.profile?.createdAt ?? user.created_at ?? new Date().toISOString(),
          watchlistMatchIds: watchedMatches.map((entry) => entry.matchId),
          watchStatuses: Object.fromEntries(
            watchedMatches.map((entry) => [
              entry.matchId,
              localProfile.watchStatuses[entry.matchId] ?? "planned"
            ])
          ),
          watchVenues: Object.fromEntries(
            watchedMatches
              .filter((entry) => entry.watchVenueSlug)
              .map((entry) => [entry.matchId, entry.watchVenueSlug ?? null])
          ),
          watchRatings: localProfile.watchRatings
        });
      })
      .catch(() => {
        ensureUser();
      });
  }, [ensureUser, hydrateFromServer, loading, resetUser, user]);
}
