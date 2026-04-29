"use client";

import { Capacitor } from "@capacitor/core";

// Picks the correct Supabase auth redirect target for web, localhost, and native shells.
export function getAuthRedirectUrl() {
  if (Capacitor.isNativePlatform()) {
    return "gameday://auth/callback";
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin.replace(/\/$/, "")}/auth/callback`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/auth/callback`;
}
