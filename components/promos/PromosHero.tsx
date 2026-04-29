// Hero block for /promos introducing the matchday deals hub and current city context.
"use client";

export function PromosHero({
  cityLabel
}: {
  cityLabel: string;
}) {
  return (
    <section className="max-w-5xl rounded-[2rem] border border-line bg-[radial-gradient(circle_at_top_left,rgba(244,185,66,0.16),transparent_36%),linear-gradient(145deg,var(--bg-surface),var(--bg-surface-elevated))] p-6 sm:p-8">
      <div className="text-[10px] uppercase tracking-[0.18em] text-mist">Watch parties pay you back</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep sm:text-4xl">
        The best match-night deals in {cityLabel}.
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-mist sm:text-base">
        Save the strongest promos to My Cup, then pull up with your QR when the room starts to fill.
      </p>
      <a
        href="#promo-board"
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-deep"
      >
        Browse promos →
      </a>
    </section>
  );
}
