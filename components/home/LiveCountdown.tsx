"use client";

import { useEffect, useMemo, useState } from "react";

import { classifyMatch } from "@/lib/time/matchWindows";

interface LiveCountdownProps {
  startsAt: string;
  liveDurationMins?: number;
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

export function LiveCountdown({ startsAt }: LiveCountdownProps) {
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
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const label = useMemo(() => {
    const context = classifyMatch(buildCountdownMatch(startsAt), now, Intl.DateTimeFormat().resolvedOptions().timeZone);

    return context.countdownLabel;
  }, [now, startsAt]);

  const reducedMotionLabel = classifyMatch(
    buildCountdownMatch(startsAt),
    new Date(),
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ).countdownLabel;

  return (
    <span aria-live="polite" aria-atomic="true" suppressHydrationWarning>
      {reducedMotion ? reducedMotionLabel : label}
    </span>
  );
}
