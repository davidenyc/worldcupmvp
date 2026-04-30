import Link from "next/link";

import { AliveMatchCard } from "@/components/home/AliveMatchCard";
import { ActionHeroError } from "@/components/home/ActionHero";
import { HomeViewTracker } from "@/components/home/HomeViewTracker";
import { EmailCaptureBanner } from "@/components/marketing/EmailCaptureBanner";
import { getFallbackTonightFeed, getTonightFeed, type TonightFeed } from "@/lib/hooks/useTonightFeed";
import { HomeScrollReset } from "./HomeScrollReset";
import { MarketingHeroActions } from "./MarketingHeroActions";

async function getResolvedTonightFeed() {
  try {
    return {
      feed: await getTonightFeed("nyc"),
      feedError: false
    };
  } catch {
    try {
      return {
        feed: await getFallbackTonightFeed("nyc"),
        feedError: false
      };
    } catch {
      return {
        feed: { hero: null, carousel: [], windowLabel: "Next match day" } satisfies TonightFeed,
        feedError: true
      };
    }
  }
}

export async function MarketingLanding() {
  const { feed: tonightFeed, feedError } = await getResolvedTonightFeed();
  return (
    <main className="bg-bg text-[color:var(--fg-primary)]">
      <HomeScrollReset />
      <HomeViewTracker variant="marketing" />
      <section className="bg-[var(--bg-surface-strong)] text-[color:var(--fg-on-strong)]">
        <div className="container-shell py-10 sm:py-20">
          <div className="max-w-5xl">
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-secondary-on-strong)]">
              World Cup 2026 starts June 11
            </div>
            <h1 className="mt-3 text-[2.45rem] font-semibold tracking-tight leading-[1.02] sm:mt-4 sm:text-5xl lg:text-6xl">
              Find the room for your match.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[color:var(--fg-secondary-on-strong)] sm:mt-4 sm:text-lg">
              17 host cities. 48 nations. Match-night rooms that fit the crowd.
            </p>
            <MarketingHeroActions />
          </div>
        </div>
      </section>

      <section className="bg-bg">
        <div className="container-shell space-y-10 py-10 sm:space-y-12 sm:py-14">
          <section>
            <div className="text-xs uppercase tracking-[0.22em] text-mist">Matchday radar</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-deep">Where tonight gets decided.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--fg-secondary)] sm:text-base">
              Start with the match that matters, then follow the crowd to the room that already feels alive.
            </p>
            {tonightFeed.carousel.length ? (
              <div className="mt-6 space-y-4">
                <AliveMatchCard match={tonightFeed.carousel[0]} />
                {tonightFeed.carousel.length > 1 ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {tonightFeed.carousel.slice(1, 3).map((match) => (
                      <AliveMatchCard key={match.matchId} match={match} variant="compact" />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : feedError ? (
              <div className="mt-6">
                <ActionHeroError />
              </div>
            ) : (
              <div className="mt-6 surface flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-mist">{tonightFeed.windowLabel}</div>
                  <div className="text-lg font-semibold tracking-tight text-deep">The next match day is coming up.</div>
                  <p className="max-w-2xl text-sm leading-6 text-[color:var(--fg-secondary)]">
                    Pick your city or your team now, and we&apos;ll point you straight to the rooms most worth showing up for.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/today?city=nyc"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
                  >
                    See the slate →
                  </Link>
                  <Link
                    href="/nyc/map"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)]"
                  >
                    Browse the map →
                  </Link>
                </div>
              </div>
            )}
          </section>

          <EmailCaptureBanner />

          <footer className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6 text-sm text-[color:var(--fg-secondary)]">
            <Link href="/about" className="font-medium text-deep">
              About
            </Link>
            <Link href="/privacy" className="font-medium text-deep">
              Privacy
            </Link>
            <Link href="/terms" className="font-medium text-deep">
              Terms
            </Link>
            <Link href="/membership" className="font-medium text-deep">
              Fan Pass · Elite · Free
            </Link>
            <span className="sm:ml-auto">World Cup 2026 watch parties for real supporter rooms.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
