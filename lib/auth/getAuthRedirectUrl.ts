"use client";

import { Capacitor } from "@capacitor/core";

// Picks the correct Supabase auth redirect target for web, localhost, and native shells.
export function getAuthRedirectUrl() {
  if (Capacitor.isNativePlatform()) {
    return "gameday://auth/callback";
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/auth/callback`;
}
