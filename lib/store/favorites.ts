"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useSession } from "@/lib/hooks/useSession";
import { useMembership } from "@/lib/store/membership";
import { useUserStore } from "@/lib/store/user";

type FavoritesState = {
  favorites: string[];
  saveBlocked: boolean;
  addFavorite: (slug: string) => void;
  toggleFavorite: (slug: string) => void;
  resetFavorites: () => void;
  clearSaveBlocked: () => void;
  hydrateFavorites: (favorites: string[]) => void;
};

let favoritesServerEnabled = false;

function syncFavoriteAdd(slug: string) {
  if (!favoritesServerEnabled) return;

  void fetch(`/api/me/favorites/${slug}`, {
    method: "POST"
  });
}

function syncFavoriteRemove(slug: string) {
  if (!favoritesServerEnabled) return;

  void fetch(`/api/me/favorites/${slug}`, {
    method: "DELETE"
  });
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      saveBlocked: false,
      // SRC: hybrid — local cache always, server-backed when authenticated.
      addFavorite: (slug) => {
        const { canSaveVenue } = useMembership.getState();
        const currentCount = get().favorites.length;
        if (!canSaveVenue(currentCount)) {
          set({ saveBlocked: true });
          return;
        }

        set((state) => ({
          saveBlocked: false,
          favorites: state.favorites.includes(slug) ? state.favorites : [...state.favorites, slug]
        }));
        syncFavoriteAdd(slug);
        useUserStore.getState().appendActivity({
          kind: "venue_saved",
          label: `Saved venue ${slug}.`,
          href: "/me"
        });
      },
      // SRC: hybrid — local cache always, server-backed when authenticated.
      toggleFavorite: (slug) =>
        set((state) => {
          if (state.favorites.includes(slug)) {
            syncFavoriteRemove(slug);
            useUserStore.getState().appendActivity({
              kind: "venue_unsaved",
              label: `Removed venue ${slug} from saved spots.`,
              href: "/me"
            });
            return {
              saveBlocked: false,
              favorites: state.favorites.filter((item) => item !== slug)
            };
          }

          const { canSaveVenue } = useMembership.getState();
          if (!canSaveVenue(get().favorites.length)) {
            return { saveBlocked: true, favorites: state.favorites };
          }

          syncFavoriteAdd(slug);
          useUserStore.getState().appendActivity({
            kind: "venue_saved",
            label: `Saved venue ${slug}.`,
            href: "/me"
          });

          return {
            saveBlocked: false,
            favorites: [...state.favorites, slug]
          };
        }),
      // SRC: local-only reset that falls back to anonymous defaults on sign-out.
      resetFavorites: () => set({ favorites: [], saveBlocked: false }),
      // SRC: local-only UX flag reset.
      clearSaveBlocked: () => set({ saveBlocked: false })
      ,
      // SRC: hybrid — server hydration with local cache fallback.
      hydrateFavorites: (favorites) => set({ favorites, saveBlocked: false })
    }),
    {
      name: "gameday-favorites"
    }
  )
);

export function useFavoritesHydration() {
  const { user, loading } = useSession();
  const hydrateFavorites = useFavoritesStore((state) => state.hydrateFavorites);

  useEffect(() => {
    if (loading) return;

    favoritesServerEnabled = Boolean(user);
    if (!user) return;

    void fetch("/api/me/favorites")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to hydrate favorites");
        }

        const data = await response.json();
        hydrateFavorites(data.favorites ?? []);
      })
      .catch(() => {});
  }, [hydrateFavorites, loading, user]);
}
