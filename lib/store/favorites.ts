"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useMembership } from "@/lib/store/membership";

type FavoritesState = {
  favorites: string[];
  saveBlocked: boolean;
  addFavorite: (slug: string) => void;
  toggleFavorite: (slug: string) => void;
  resetFavorites: () => void;
  clearSaveBlocked: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      saveBlocked: false,
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
      },
      toggleFavorite: (slug) =>
        set((state) => {
          if (state.favorites.includes(slug)) {
            return {
              saveBlocked: false,
              favorites: state.favorites.filter((item) => item !== slug)
            };
          }

          const { canSaveVenue } = useMembership.getState();
          if (!canSaveVenue(get().favorites.length)) {
            return { saveBlocked: true, favorites: state.favorites };
          }

          return {
            saveBlocked: false,
            favorites: [...state.favorites, slug]
          };
        }),
      resetFavorites: () => set({ favorites: [], saveBlocked: false }),
      clearSaveBlocked: () => set({ saveBlocked: false })
    }),
    {
      name: "gameday-favorites"
    }
  )
);
