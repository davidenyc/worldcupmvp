// Hero block for /promos introducing the matchday deals hub and current city context.
"use client";

export function PromosHero({
  cityLabel
}: {
  cityLabel: string;
}) {
  return (
    <section className="max-w-4xl">
      <div className="text-sm uppercase tracking-[0.2em] text-mist">Matchday deals</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-deep sm:text-4xl">
        Get to the bar early. Get rewarded.
      </h1>
      <p className="mt-3 text-sm leading-7 text-mist sm:text-base">
        Promo codes from {cityLabel}&apos;s top watch spots. Save them to My World Cup, then show the QR at the door.
      </p>
    </section>
  );
}
