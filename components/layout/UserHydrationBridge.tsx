"use client";

import { useUserHydration } from "@/lib/store/user";

// Global client bridge that hydrates the user store from Supabase after auth state resolves.
export function UserHydrationBridge() {
  useUserHydration();
  return null;
}
