"use client";

import { useEffect } from "react";
import Link from "next/link";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl">⚽</div>
      <h1 className="mt-6 text-4xl font-semibold text-deep dark:text-white">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-deep/60 dark:text-white/60">
        The page hit a matchday glitch. Try again, or head back to the main map.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep"
        >
          Try again
        </button>
        <Link
          href="/"
          className="min-h-11 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-deep dark:text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
