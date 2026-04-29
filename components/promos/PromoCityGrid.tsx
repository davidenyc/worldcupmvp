// City drill-down grid for /promos showing host-city deal counts and filter links.
"use client";

import { HOST_CITIES } from "@/lib/data/hostCities";

export function PromoCityGrid({
  countsByCity,
  activeCity,
  onSelect
}: {
  countsByCity: Record<string, number>;
  activeCity: string | null;
  onSelect: (cityKey: string | null) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <div className="text-sm uppercase tracking-[0.18em] text-mist">By city</div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-deep">Browse the host-city deal board</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HOST_CITIES.map((city) => {
          const active = activeCity === city.key;
          return (
            <button
              key={city.key}
              type="button"
              onClick={() => onSelect(active ? null : city.key)}
              className={`rounded-2xl border p-4 text-left transition ${
                active ? "border-gold bg-gold/10" : "border-line bg-surface hover:bg-surface-2"
              }`}
            >
              <div className="text-base font-semibold text-deep">{city.label}</div>
              <div className="mt-2 text-sm text-mist">{countsByCity[city.key] ?? 0} promos</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
