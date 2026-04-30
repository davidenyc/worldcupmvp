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

export function ActionHero({ cityKey, cityLabel, initialFeed, fallbackMatch }: ActionHeroProps) {
  const hero = initialFeed.hero;

  if (!hero) {
    return (
      <section className="surface p-6 sm:p-8">
        <div className="text-[11px] uppercase tracking-[0.2em] text-mist">
          {fallbackMatch ? `${fallbackMatch.label.toUpperCase()} · WORLD CUP 2026` : "NEXT MATCH DAY · WORLD CUP 2026"}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-deep sm:text-4xl">
          {fallbackMatch ? `${fallbackMatch.homeLabel} vs ${fallbackMatch.awayLabel}` : "World Cup starts June 11."}
        </h1>
        <div className="mt-4 text-base font-medium text-[color:var(--fg-primary)]">
          {fallbackMatch ? <>Kickoff <LiveCountdown startsAt={fallbackMatch.startsAt} /></> : "Plan your first match-day room now."}
        </div>
        <div className="mt-5 h-px w-full max-w-md bg-[color:var(--border-subtle)]" />
        <div className="mt-5 space-y-2 text-sm text-[color:var(--fg-secondary)]">
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
      </section>
    );
  }

  const primaryCountrySlug = getPrimaryCountrySlug(hero);
  const href = `/${cityKey}/map?match=${hero.matchId}&country=${primaryCountrySlug}`;
  const eyebrow = hero.timeContext.window === "live" ? "LIVE NOW · WORLD CUP 2026" : `${initialFeed.windowLabel.toUpperCase()} · WORLD CUP 2026`;
  const neighborhoodLine = hero.topNeighborhood
    ? `Strongest ${hero.topNeighborhood.supporterCountrySlug === hero.homeCountry.slug ? hero.homeCountry.name : hero.awayCountry.name} crowd: ${hero.topNeighborhood.name}`
    : null;
  const crowdLine = hero.projectedGoingCount > 0
    ? `${hero.projectedGoingCount}+ fans lining up · ${hero.crowdSignalCopy}`
    : null;

  return (
    <section className="surface p-6 sm:p-8">
      <div className="text-[11px] uppercase tracking-[0.2em] text-mist">{eyebrow}</div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-deep sm:text-4xl">
        {hero.homeCountry.flagEmoji} {hero.homeCountry.name} vs {hero.awayCountry.name} {hero.awayCountry.flagEmoji}
      </h1>
      <div className="mt-4 text-base font-medium text-[color:var(--fg-primary)]">
        {hero.timeContext.window === "live" ? "Match in progress." : <>Kickoff <LiveCountdown startsAt={hero.startsAt} /></>}
      </div>
      <div className="mt-5 h-px w-full max-w-md bg-[color:var(--border-subtle)]" />
      <div className="mt-5 space-y-2 text-sm text-[color:var(--fg-secondary)]">
        <p id="action-hero-venue-count">{hero.venueCount} venues showing this in {cityLabel}</p>
        {crowdLine ? <p className="font-medium text-deep">{crowdLine}</p> : null}
        {neighborhoodLine ? <p>{neighborhoodLine}</p> : null}
      </div>
      <ActionHeroCta
        href={href}
        matchId={hero.matchId}
        isUserMatch={hero.isUserMatch}
        aria-describedby="action-hero-venue-count"
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)] lg:w-auto lg:min-w-72"
      >
        Find me a spot for this match →
      </ActionHeroCta>
    </section>
  );
}

export function ActionHeroSkeleton() {
  return (
    <div className="surface animate-pulse p-6 sm:p-8">
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
  );
}

export function ActionHeroError() {
  return (
    <section className="surface p-6 sm:p-8">
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
    </section>
  );
}
