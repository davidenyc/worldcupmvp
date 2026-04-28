"use client";

import { useEffect } from "react";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-[100dvh] bg-bg text-deep">
        <main className="container-shell flex min-h-[100dvh] flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl">🏟️</div>
          <h1 className="mt-6 text-4xl font-semibold text-deep dark:text-white">GameDay Map hit an error</h1>
          <p className="mt-3 max-w-md text-sm text-deep/60 dark:text-white/60">
            We couldn&apos;t load this screen. Refresh the page or try the reset button below.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 min-h-11 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-deep"
          >
            Reset app
          </button>
        </main>
      </body>
    </html>
  );
}
