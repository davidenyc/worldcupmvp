"use client";

import { create } from "zustand";

type FavoritesState = {
  favorites: string[];
  toggleFavorite: (slug: string) => void;
};

export const useFavoritesStore = create<FavoritesState>((set) => ({
  favorites: [],
  toggleFavorite: (slug) =>
    set((state) => ({
      favorites: state.favorites.includes(slug)
        ? state.favorites.filter((item) => item !== slug)
        : [...state.favorites, slug]
    }))
}));
