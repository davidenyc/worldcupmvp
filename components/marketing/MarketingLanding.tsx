// First-touch marketing landing used on / before a user has personalized or signed in.
import Link from "next/link";

export function MarketingLanding() {
  return (
    <main className="bg-bg text-deep">
      <section className="bg-deep text-[color:var(--fg-on-strong)]">
        <div className="container-shell py-16 sm:py-20">
          <div className="max-w-4xl">
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-secondary-on-strong)]">
              World Cup 2026
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Find your watch party for World Cup 2026.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[color:var(--fg-secondary-on-strong)]">
              17 host cities · 48 nations · every fan diaspora.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/welcome"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-6 text-base font-semibold text-[color:var(--fg-on-accent)]"
              >
                Personalize my Cup →
              </Link>
              <Link
                href="/nyc/map"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-6 text-base font-semibold text-[color:var(--fg-on-strong)]"
              >
                See the map →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-10 sm:py-14">
        <div className="surface p-6">
          <div className="text-sm text-mist">
            Marketing landing shell is live. Full sections land in the next commit.
          </div>
        </div>
      </section>
    </main>
  );
}
