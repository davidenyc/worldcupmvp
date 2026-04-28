"use client";

import { useEffect, useState } from "react";

const KICKOFF_AT = new Date("2026-06-11T19:00:00-04:00").getTime();

function getTimeLeft() {
  const delta = Math.max(0, KICKOFF_AT - Date.now());
  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);

  return { days, hours, minutes };
}

export function KickoffCountdown({ compact = false }: { compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="inline-flex max-w-max items-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[color:var(--fg-secondary)]">
        <span className="text-gold">{String(timeLeft.days).padStart(2, "0")}d</span>
        <span className="mx-1 text-[color:var(--fg-muted)]">·</span>
        <span className="text-gold">{String(timeLeft.hours).padStart(2, "0")}h</span>
        <span className="mx-1 text-[color:var(--fg-muted)]">·</span>
        <span className="text-gold">{String(timeLeft.minutes).padStart(2, "0")}m</span>
        <span className="ml-2">until kickoff</span>
      </div>
    );
  }

  return (
    <div className="inline-flex max-w-max items-center rounded-full bg-[#0a1628] px-4 py-3 text-sm font-semibold text-white shadow-lg">
      <span className="text-[#f4b942]">{String(timeLeft.days).padStart(2, "0")}</span>
      <span className="mx-1.5 text-white/70">days</span>
      <span className="text-[#f4b942]">{String(timeLeft.hours).padStart(2, "0")}</span>
      <span className="mx-1.5 text-white/70">hrs</span>
      <span className="text-[#f4b942]">{String(timeLeft.minutes).padStart(2, "0")}</span>
      <span className="mx-1.5 text-white/70">min until kickoff</span>
    </div>
  );
}
