"use client";

import { useEffect } from "react";

import { trackHomeView } from "@/lib/analytics/track";
import { useUserCity } from "@/lib/hooks/useUserCity";

export function HomeViewTracker({ variant }: { variant: "marketing" | "active" }) {
  const { isExplicit } = useUserCity();

  useEffect(() => {
    trackHomeView({ variant, isExplicit });
  }, [isExplicit, variant]);

  return null;
}
