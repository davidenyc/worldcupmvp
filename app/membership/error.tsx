// Error boundary for membership pages so pricing and concierge flows fail gracefully.
"use client";

import Link from "next/link";

export default function MembershipError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-shell flex min-h-[calc(100dvh-var(--header-h))] items-center justify-center py-12">
      <div className="surface max-w-xl p-8 text-center">
        <div className="text-[10px] uppercase tracking-[0.24em] text-mist">Membership error</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-deep">
          Couldn&apos;t load membership info.
        </h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--fg-secondary)]">
          Your subscription is safe. Try again in a moment, or head back home if you just need the city map.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)]"
          >
            Reset
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-deep"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
