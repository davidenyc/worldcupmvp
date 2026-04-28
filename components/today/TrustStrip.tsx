"use client";

type TrustStripProps = {
  venueCount: number;
  nationCount: number;
  hostCityCount: number;
};

export function TrustStrip({ venueCount, nationCount, hostCityCount }: TrustStripProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {[
        { value: venueCount.toLocaleString(), label: "venues mapped", caption: "Real rooms ranked for World Cup matchdays." },
        { value: nationCount.toLocaleString(), label: "nations", caption: "Supporter communities represented across the map." },
        { value: hostCityCount.toLocaleString(), label: "host cities", caption: "Every 2026 city anchored to a local watch guide." }
      ].map((item) => (
        <div key={item.label} className="rounded-[1.5rem] border border-line bg-[var(--bg-surface)] p-5 text-center shadow-sm">
          <div className="text-3xl font-semibold text-deep">{item.value}</div>
          <div className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-mist">{item.label}</div>
          <p className="mt-2 text-sm text-[color:var(--fg-secondary)]">{item.caption}</p>
        </div>
      ))}
    </section>
  );
}
