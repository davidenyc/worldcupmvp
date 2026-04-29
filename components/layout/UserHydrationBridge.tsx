"use client";

import { useFavoritesHydration } from "@/lib/store/favorites";
import { useMembershipHydration } from "@/lib/store/membership";
import { useUserHydration } from "@/lib/store/user";

// Global client bridge that hydrates the user store from Supabase after auth state resolves.
export function UserHydrationBridge() {
  useUserHydration();
  useFavoritesHydration();
  useMembershipHydration();
  return null;
}
