"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  favoriteCity: string;
  favoriteCountries: string[];
  followedCountries: string[];
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

type UserStore = {
  profile: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  ensureUser: () => void;
  resetUser: () => void;
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
    favoriteCountries: [],
    followedCountries: [],
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
  const followedCountries = profile.followedCountries ?? profile.favoriteCountries ?? [];

  return {
    ...createDefaultProfile(),
    ...profile,
    favoriteCountries,
    followedCountries
  };
}

const useUserStore = create<UserStore>()(
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
        })
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
