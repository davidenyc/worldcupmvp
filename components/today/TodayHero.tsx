"use client";

type TodayHeroProps = {
  headline: string;
  subhead: string;
  venueCount: number;
  reservationsCount: number;
  hostingCount: number;
  onFindSpot: () => void;
};

export function TodayHero({
  headline,
  subhead,
  venueCount,
  reservationsCount,
  hostingCount,
  onFindSpot
}: TodayHeroProps) {
  return (
    <section className="rounded-[2rem] border border-line bg-[var(--bg-surface)] px-4 py-6 shadow-card sm:px-6">
      <div className="text-sm font-semibold uppercase tracking-[0.24em] text-mist">Watching today</div>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-deep sm:text-5xl">{headline}</h1>
      <p className="mt-3 max-w-xl text-body text-[color:var(--fg-secondary)]">
        {subhead}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onFindSpot}
          aria-label="Find your watch spot"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-[color:var(--fg-on-accent)]"
        >
          Find your spot →
        </button>
      </div>
      <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-line bg-[var(--bg-surface-elevated)] p-4 sm:grid-cols-3">
        <div className="min-h-11">
          <div className="text-xl font-semibold text-deep">{venueCount}</div>
          <div className="text-sm text-mist">venues</div>
        </div>
        <div className="min-h-11">
          <div className="text-xl font-semibold text-deep">{reservationsCount}</div>
          <div className="text-sm text-mist">reservations open</div>
        </div>
        <div className="min-h-11">
          <div className="text-xl font-semibold text-deep">{hostingCount}</div>
          <div className="text-sm text-mist">hosting tonight</div>
        </div>
      </div>
    </section>
  );
}
