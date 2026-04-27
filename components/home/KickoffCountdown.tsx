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

export function KickoffCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

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
