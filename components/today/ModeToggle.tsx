"use client";

import type { TodayPageMode } from "@/lib/data/today";

type ModeToggleProps = {
  activeMode: TodayPageMode;
  counts: Record<TodayPageMode, number>;
  onChange: (mode: TodayPageMode) => void;
};

const MODE_LABELS: Record<TodayPageMode, string> = {
  all: "All",
  bar: "Bars",
  restaurant: "Restaurants"
};

export function ModeToggle({ activeMode, counts, onChange }: ModeToggleProps) {
  return (
    <div className="grid gap-3 md:mx-auto md:max-w-2xl md:grid-cols-3">
      {(["all", "bar", "restaurant"] as TodayPageMode[]).map((mode) => {
        const active = mode === activeMode;
        return (
          <button
            key={mode}
            type="button"
            aria-label={`Show ${MODE_LABELS[mode].toLowerCase()}`}
            onClick={() => onChange(mode)}
            className={`inline-flex min-h-11 items-center justify-between rounded-full border px-4 py-3 text-sm font-semibold ${
              active
                ? "border-gold bg-gold text-[color:var(--fg-on-accent)]"
                : "border-line bg-[var(--bg-surface)] text-deep"
            }`}
          >
            <span>{MODE_LABELS[mode]}</span>
            <span className={active ? "text-[color:var(--fg-on-accent)]/80" : "text-mist"}>({counts[mode]})</span>
          </button>
        );
      })}
    </div>
  );
}
