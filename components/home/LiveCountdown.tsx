"use client";

import { useEffect, useMemo, useState } from "react";

import { classifyMatch } from "@/lib/time/matchWindows";

interface LiveCountdownProps {
  startsAt: string;
  liveDurationMins?: number;
  withSeconds?: boolean;
}

function buildCountdownMatch(startsAt: string) {
  return {
    id: "countdown",
    homeCountry: "",
    awayCountry: "",
    startsAt,
    stage: "group" as const,
    group: null,
    stadiumName: "",
    city: "",
    isNYNJ: false,
    isCanada: false,
    isMexico: false,
    competition: "",
    note: "",
    stageLabel: "",
    venue: {
      city: "",
      stadium: ""
    }
  };
}

function readReducedMotionPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function formatDetailedCountdown(diffMs: number) {
  if (diffMs <= 0) return "live now";

  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h until kickoff` : `${days}d until kickoff`;
  }

  if (hours >= 6) {
    return minutes > 0 ? `${hours}h ${minutes}m until kickoff` : `${hours}h until kickoff`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${String(seconds).padStart(2, "0")}s until kickoff`;
  }

  return `${minutes}m ${String(seconds).padStart(2, "0")}s until kickoff`;
}

export function LiveCountdown({ startsAt, withSeconds = false }: LiveCountdownProps) {
  const [now, setNow] = useState(() => new Date());
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (readReducedMotionPreference()) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, withSeconds ? 1_000 : 30_000);

    return () => window.clearInterval(timer);
  }, [withSeconds]);

  const label = useMemo(() => {
    const context = classifyMatch(buildCountdownMatch(startsAt), now, Intl.DateTimeFormat().resolvedOptions().timeZone);

    return context.countdownLabel;
  }, [now, startsAt]);

  const reducedMotionLabel = classifyMatch(
    buildCountdownMatch(startsAt),
    new Date(),
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ).countdownLabel;
  const detailedLabel = useMemo(() => {
    if (!withSeconds) return label;
    return formatDetailedCountdown(new Date(startsAt).getTime() - now.getTime());
  }, [label, now, startsAt, withSeconds]);

  return (
    <span aria-live="polite" aria-atomic="true" suppressHydrationWarning>
      {reducedMotion ? reducedMotionLabel : detailedLabel}
    </span>
  );
}
