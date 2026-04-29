// Error boundary for all city routes so map and city-specific pages recover without showing a stack trace.
"use client";

import Link from "next/link";

export default function CityRouteError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-shell flex min-h-[calc(100dvh-var(--header-h))] items-center justify-center py-12">
      <div className="surface max-w-xl p-8 text-center">
        <div className="text-[10px] uppercase tracking-[0.24em] text-mist">City route error</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-deep">
          This city page hit a snag.
        </h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--fg-secondary)]">
          Reset to retry the city map, or jump home and pick your route again.
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
