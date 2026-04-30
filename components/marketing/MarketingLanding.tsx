import Link from "next/link";

import { AliveMatchCard } from "@/components/home/AliveMatchCard";
import { ActionHeroError } from "@/components/home/ActionHero";
import { HomeViewTracker } from "@/components/home/HomeViewTracker";
import { EmailCaptureBanner } from "@/components/marketing/EmailCaptureBanner";
import { getAllCountries } from "@/lib/data/repository";
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
        feed: { hero: null, carousel: [], windowLabel: "Schedule loading" } satisfies TonightFeed,
        feedError: true
      };
    }
  }
}

export async function MarketingLanding() {
  const [countries, tonightFeedResult] = await Promise.all([getAllCountries(), getResolvedTonightFeed()]);
  const { feed: tonightFeed, feedError } = tonightFeedResult;
  return (
    <main className="bg-bg text-[color:var(--fg-primary)]">
      <HomeScrollReset />
      <HomeViewTracker variant="marketing" />
      <section className="bg-[var(--bg-surface-strong)] text-[color:var(--fg-on-strong)]">
        <div className="container-shell py-16 sm:py-20">
          <div className="max-w-5xl">
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--fg-secondary-on-strong)]">
              World Cup 2026 starts June 11
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Find the room for your match.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[color:var(--fg-secondary-on-strong)]">
              17 host cities. 48 nations. Every diaspora.
            </p>
            <MarketingHeroActions countries={countries} />
          </div>
        </div>
      </section>

      <section className="bg-bg">
        <div className="container-shell space-y-10 py-10 sm:space-y-12 sm:py-14">
          <section>
            <div className="surface px-5 py-4 text-sm font-medium text-[color:var(--fg-secondary)]">
              Watch parties planned by fans, ranked by who actually shows up.
            </div>
          </section>

          <section>
            <div className="text-xs uppercase tracking-[0.22em] text-mist">Alive matches</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-deep">Where tonight gets decided.</h2>
            {tonightFeed.carousel.length ? (
              <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                {tonightFeed.carousel.slice(0, 3).map((match) => (
                  <AliveMatchCard key={match.matchId} match={match} variant="compact" />
                ))}
              </div>
            ) : feedError ? (
              <div className="mt-6">
                <ActionHeroError />
              </div>
            ) : (
              <div className="mt-6 surface px-5 py-4 text-sm text-[color:var(--fg-secondary)]">
                Schedule loading...
              </div>
            )}
          </section>

          <section className="surface px-5 py-5 text-sm text-[color:var(--fg-secondary)]">
            <div className="grid gap-3 sm:grid-cols-3">
              <div><span className="font-semibold text-deep">1.</span> Pick your city.</div>
              <div><span className="font-semibold text-deep">2.</span> Pick your team.</div>
              <div><span className="font-semibold text-deep">3.</span> Show up before kickoff.</div>
            </div>
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
