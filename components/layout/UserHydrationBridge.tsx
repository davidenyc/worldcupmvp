"use client";

import { useFavoritesHydration } from "@/lib/store/favorites";
import { useUserHydration } from "@/lib/store/user";

// Global client bridge that hydrates the user store from Supabase after auth state resolves.
export function UserHydrationBridge() {
  useUserHydration();
  useFavoritesHydration();
  return null;
}
