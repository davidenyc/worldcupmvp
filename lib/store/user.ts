"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  watchVenues: Record<string, string | null>;
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

export interface UserActivityEntry {
  at: number;
  kind: string;
  label: string;
  href?: string;
}

export type UserStore = {
  profile: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  ensureUser: () => void;
  resetUser: () => void;
  toggleWatchlistMatch: (matchId: string) => void;
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
};

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
    watchVenues: {},
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
    watchVenues: profile.watchVenues ?? {},
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

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: createDefaultProfile(),
      updateUser: (updates) =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            ...updates
          })
        })),
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
      resetUser: () =>
        set({
          profile: createDefaultProfile()
        }),
      toggleWatchlistMatch: (matchId) =>
        set((state) => {
          const alreadyWatching = state.profile.watchlistMatchIds.includes(matchId);
          if (alreadyWatching) {
            const nextWatchVenues = { ...state.profile.watchVenues };
            delete nextWatchVenues[matchId];

            return {
              profile: appendActivityEntry(normalizeProfile({
                ...state.profile,
                watchlistMatchIds: state.profile.watchlistMatchIds.filter((entry) => entry !== matchId),
                watchVenues: nextWatchVenues
              }), {
                kind: "watchlist_removed",
                label: "Removed a match from My Cup watchlist.",
                href: "/matches"
              })
            };
          }

          return {
            profile: appendActivityEntry(normalizeProfile({
                ...state.profile,
                watchlistMatchIds: [...state.profile.watchlistMatchIds, matchId]
            }), {
              kind: "watchlist_added",
              label: "Added a match to My Cup watchlist.",
              href: "/matches"
            })
          };
        }),
      setWatchVenue: (matchId, venueSlug) =>
        set((state) => ({
          profile: appendActivityEntry(normalizeProfile({
            ...state.profile,
            watchlistMatchIds: state.profile.watchlistMatchIds.includes(matchId)
              ? state.profile.watchlistMatchIds
              : [...state.profile.watchlistMatchIds, matchId],
            watchVenues: {
              ...state.profile.watchVenues,
              [matchId]: venueSlug
            }
          }), {
            kind: "watch_venue_set",
            label: venueSlug ? `Picked a venue for match ${matchId}.` : `Updated venue plan for match ${matchId}.`,
            href: "/me"
          })
        })),
      clearWatchVenue: (matchId) =>
        set((state) => {
          const nextWatchVenues = { ...state.profile.watchVenues };
          delete nextWatchVenues[matchId];
          return {
            profile: normalizeProfile({
              ...state.profile,
              watchVenues: nextWatchVenues
            })
          };
        }),
      appendActivity: (entry) =>
        set((state) => ({
          profile: appendActivityEntry(state.profile, entry)
        })),
      clearActivity: () =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            activity: []
          })
        })),
      setFirstName: (firstName) =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            firstName: firstName?.trim() || undefined,
            displayName: firstName?.trim() || state.profile.displayName
          })
        })),
      setHomeCity: (homeCity) =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            homeCity,
            favoriteCity: homeCity ?? state.profile.favoriteCity
          })
        })),
      setFavoriteCountry: (favoriteCountrySlug) =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            favoriteCountrySlug,
            favoriteCountries: favoriteCountrySlug ? [favoriteCountrySlug, ...state.profile.favoriteCountries.filter((entry) => entry !== favoriteCountrySlug)] : [],
            followedCountries: favoriteCountrySlug
              ? [favoriteCountrySlug, ...state.profile.followedCountries.filter((entry) => entry !== favoriteCountrySlug)]
              : state.profile.followedCountries,
            followingCountrySlugs: favoriteCountrySlug
              ? [favoriteCountrySlug, ...state.profile.followingCountrySlugs.filter((entry) => entry !== favoriteCountrySlug)]
              : state.profile.followingCountrySlugs
          })
        })),
      setFollowing: (followingCountrySlugs) =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            followingCountrySlugs,
            followedCountries: followingCountrySlugs,
            favoriteCountries: state.profile.favoriteCountrySlug
              ? [state.profile.favoriteCountrySlug, ...followingCountrySlugs.filter((entry) => entry !== state.profile.favoriteCountrySlug)]
              : followingCountrySlugs
          })
        })),
      setDefaultFilters: (filters) =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            defaultFilters: {
              ...state.profile.defaultFilters,
              ...filters
            }
          })
        })),
      setPromoOptIns: (optIns) =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            promoOptIns: {
              ...state.profile.promoOptIns,
              ...optIns
            }
          })
        })),
      markWelcomeSeen: (at = Date.now()) =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
            welcomeSeenAt: at
          })
        })),
      resetOnboarding: () =>
        set((state) => ({
          profile: normalizeProfile({
            ...state.profile,
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
            watchVenues: {}
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
