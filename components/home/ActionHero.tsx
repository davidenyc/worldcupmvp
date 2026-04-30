import Link from "next/link";

import type { TonightHeroData } from "@/lib/hooks/useTonightFeed";
import { SkeletonLine } from "@/components/ui/SkeletonCard";
import { ActionHeroCta } from "./ActionHeroCta";
import { ActionHeroRefreshButton } from "./ActionHeroRefreshButton";
import { LiveCountdown } from "./LiveCountdown";

interface ActionHeroProps {
  cityKey: string;
  cityLabel: string;
  userCountrySlug?: string;
  initialFeed: {
    hero: TonightHeroData | null;
    windowLabel: string;
  };
  fallbackMatch?: {
    label: string;
    homeLabel: string;
    awayLabel: string;
    startsAt: string;
    venueCount?: number;
  } | null;
}

function getPrimaryCountrySlug(hero: TonightHeroData) {
  if (hero.isUserMatch && hero.homeCountry.slug !== hero.awayCountry.slug) {
    return hero.homeCountry.slug === hero.topNeighborhood?.supporterCountrySlug
      ? hero.homeCountry.slug
      : hero.awayCountry.slug === hero.topNeighborhood?.supporterCountrySlug
        ? hero.awayCountry.slug
        : hero.homeCountry.slug;
  }

  return hero.homeCountry.slug;
}

function getHeroBackdrop(slug: string) {
  switch (slug) {
    case "mexico":
      return "linear-gradient(135deg, rgba(13, 96, 64, 0.96), rgba(14, 27, 43, 0.88)), radial-gradient(circle at top right, rgba(236, 191, 78, 0.26), transparent 34%)";
    case "argentina":
      return "linear-gradient(135deg, rgba(50, 108, 168, 0.96), rgba(14, 27, 43, 0.9)), radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 38%)";
    case "brazil":
      return "linear-gradient(135deg, rgba(28, 112, 64, 0.96), rgba(14, 27, 43, 0.88)), radial-gradient(circle at top right, rgba(244, 185, 66, 0.28), transparent 36%)";
    case "france":
      return "linear-gradient(135deg, rgba(30, 62, 138, 0.96), rgba(14, 27, 43, 0.88)), radial-gradient(circle at top right, rgba(205, 63, 63, 0.22), transparent 36%)";
    case "portugal":
      return "linear-gradient(135deg, rgba(128, 23, 51, 0.96), rgba(14, 27, 43, 0.88)), radial-gradient(circle at top right, rgba(244, 185, 66, 0.22), transparent 36%)";
    default:
      return "linear-gradient(135deg, rgba(21, 34, 55, 0.96), rgba(14, 27, 43, 0.88)), radial-gradient(circle at top right, rgba(244, 185, 66, 0.2), transparent 36%)";
  }
}

export function ActionHero({ cityKey, cityLabel, initialFeed, fallbackMatch }: ActionHeroProps) {
  const hero = initialFeed.hero;

  if (!hero) {
    return (
      <section className="overflow-hidden rounded-[1.8rem] border border-line bg-[var(--bg-surface)] shadow-card">
        <div
          className="min-h-[17rem] px-6 py-6 text-[color:var(--fg-on-strong)] sm:min-h-[20rem] sm:px-8 sm:py-8"
          style={{ background: getHeroBackdrop("default") }}
        >
        <div className="text-[11px] uppercase tracking-[0.2em] text-mist">
          {fallbackMatch ? `${fallbackMatch.label.toUpperCase()} · WORLD CUP 2026` : "NEXT MATCH DAY · WORLD CUP 2026"}
        </div>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.04em] text-[color:var(--fg-on-strong)] sm:text-5xl">
          {fallbackMatch ? `${fallbackMatch.homeLabel} vs ${fallbackMatch.awayLabel}` : "World Cup starts June 11."}
        </h1>
        <div className="mt-4 text-base font-semibold text-[color:var(--fg-secondary-on-strong)]">
          {fallbackMatch ? <LiveCountdown startsAt={fallbackMatch.startsAt} withSeconds /> : "Plan your first match-day room now."}
        </div>
        <div className="mt-5 h-px w-full max-w-md bg-white/15" />
        <div className="mt-5 space-y-2 text-sm text-[color:var(--fg-secondary-on-strong)]">
          <p>
            {fallbackMatch
              ? `World Cup 2026 opens soon. Start with ${cityLabel} and line up your room before kickoff.`
              : `Start with ${cityLabel} and line up your room before kickoff.`}
          </p>
          {fallbackMatch?.venueCount ? <p>{fallbackMatch.venueCount} venues already mapped in {cityLabel}</p> : null}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/today?city=${cityKey}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)]"
          >
            Browse next match day →
          </Link>
          <ActionHeroRefreshButton className="inline-flex min-h-12 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-[color:var(--fg-primary)]">
            Refresh schedule
          </ActionHeroRefreshButton>
        </div>
        </div>
      </section>
    );
  }

  const primaryCountrySlug = getPrimaryCountrySlug(hero);
  const href = `/${cityKey}/map?match=${hero.matchId}&country=${primaryCountrySlug}`;
  const eyebrow = hero.timeContext.window === "live" ? "LIVE NOW · WORLD CUP 2026" : `${initialFeed.windowLabel.toUpperCase()} · WORLD CUP 2026`;
  const neighborhoodLine = hero.topNeighborhood
    ? `Strongest ${hero.topNeighborhood.supporterCountrySlug === hero.homeCountry.slug ? hero.homeCountry.name : hero.awayCountry.name} crowd: ${hero.topNeighborhood.name}`
    : null;
  const crowdLine = hero.projectedGoingCount > 0 ? `${hero.projectedGoingCount}+ fans lining up · ${hero.crowdSignalCopy}` : null;

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-line bg-[var(--bg-surface)] shadow-card">
      <div
        className="relative min-h-[25rem] overflow-hidden px-6 py-6 text-[color:var(--fg-on-strong)] sm:min-h-[29rem] sm:px-8 sm:py-8"
        style={{ background: getHeroBackdrop(primaryCountrySlug) }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(10,22,40,0.28)_40%,rgba(10,22,40,0.88)_100%)]" />
        <div className="absolute -right-6 top-5 text-[8rem] opacity-10 sm:text-[11rem]">{hero.homeCountry.flagEmoji}</div>
        <div className="relative flex h-full flex-col justify-end">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--fg-secondary-on-strong)]">{eyebrow}</div>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-[0.98] tracking-[-0.05em] text-[color:var(--fg-on-strong)] sm:text-5xl">
            {hero.homeCountry.flagEmoji} {hero.homeCountry.name} vs {hero.awayCountry.name} {hero.awayCountry.flagEmoji}
          </h1>
          <div className="mt-4 text-base font-semibold text-[color:var(--fg-secondary-on-strong)]">
            {hero.timeContext.window === "live" ? "Match in progress." : <LiveCountdown startsAt={hero.startsAt} withSeconds />}
          </div>
          <div className="mt-5 h-px w-full max-w-md bg-white/15" />
          <div className="mt-5 space-y-2 text-sm text-[color:var(--fg-secondary-on-strong)]">
            <p id="action-hero-venue-count">{hero.venueCount} venues showing this in {cityLabel}</p>
            {neighborhoodLine ? <p>{neighborhoodLine}</p> : null}
          </div>
          <ActionHeroCta
            href={href}
            matchId={hero.matchId}
            isUserMatch={hero.isUserMatch}
            aria-describedby="action-hero-venue-count"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-5 text-base font-semibold text-[color:var(--fg-on-accent)] lg:max-w-[22rem]"
          >
            Take me there →
          </ActionHeroCta>
          <div className="mt-4 text-sm font-medium text-[color:var(--fg-secondary-on-strong)]">
            {crowdLine ? `⭐ ${crowdLine}` : `⭐ ${Math.max(12, Math.round(hero.venueCount * 1.9))} fans already locked in`}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ActionHeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-line bg-[var(--bg-surface)] shadow-card">
      <div className="animate-pulse p-6 sm:p-8">
      <div className="space-y-5">
        <SkeletonLine className="h-3 w-40" />
        <SkeletonLine className="h-10 w-full max-w-xl" />
        <SkeletonLine className="h-5 w-40" />
        <div className="h-px w-full max-w-md bg-[color:var(--border-subtle)]" />
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-56" />
          <SkeletonLine className="h-4 w-72" />
        </div>
        <SkeletonLine className="h-12 w-full rounded-full lg:w-72" />
      </div>
      </div>
    </div>
  );
}

export function ActionHeroError() {
  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-line bg-[var(--bg-surface)] shadow-card">
      <div className="p-6 sm:p-8">
      <div className="text-[11px] uppercase tracking-[0.2em] text-mist">Next match day · World Cup 2026</div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-deep sm:text-4xl">
        We&apos;re lining up the next match day.
      </h1>
      <p className="mt-4 text-sm text-[color:var(--fg-secondary)]">
        Venue counts and crowd signals can take a second. Try refresh and we&apos;ll pull the latest.
      </p>
      <ActionHeroRefreshButton className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-[color:var(--fg-primary)]">
        Refresh
      </ActionHeroRefreshButton>
      </div>
    </section>
  );
}
