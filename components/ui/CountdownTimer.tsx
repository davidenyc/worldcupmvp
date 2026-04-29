"use client";

import { useEffect, useMemo, useState } from "react";

function getTimeLeft(targetDate: string) {
  const delta = Date.parse(targetDate) - Date.now();
  if (delta <= 0) return null;

  const totalSeconds = Math.floor(delta / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export function CountdownTimer({ targetDate, label }: { targetDate: string; label?: string }) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetDate));
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  const cells = useMemo(
    () =>
      timeLeft
        ? [
            { value: timeLeft.days, label: "Days" },
            { value: timeLeft.hours, label: "Hours" },
            { value: timeLeft.minutes, label: "Minutes" },
            { value: timeLeft.seconds, label: "Seconds" }
          ]
        : [],
    [timeLeft]
  );

  if (!timeLeft) {
    return <div className="text-lg font-semibold text-deep">Tournament underway! ⚽</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {cells.map((cell) => (
          <div key={cell.label} className="rounded-2xl bg-deep px-4 py-3 text-center">
            <div className="text-3xl font-bold text-gold">{String(cell.value).padStart(2, "0")}</div>
            <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--fg-secondary-on-strong)]">{cell.label}</div>
          </div>
        ))}
      </div>
      {label ? <div className="text-sm text-[color:var(--fg-secondary)]">{label}</div> : null}
    </div>
  );
}
