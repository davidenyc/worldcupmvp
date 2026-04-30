"use client";

import { useRouter } from "next/navigation";

import { trackAliveMatchCardCtaClick } from "@/lib/analytics/track";
import type { TonightHeroData } from "@/lib/hooks/useTonightFeed";
import { getCityTimeZone } from "@/lib/data/cityTimezones";
import { CrowdNeighborhoodPill } from "./CrowdNeighborhoodPill";
import { LiveCountdown } from "./LiveCountdown";

interface AliveMatchCardProps {
  match: TonightHeroData;
  variant?: "default" | "compact";
}

function formatKickoffLabel(startsAt: string, cityKey: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: getCityTimeZone(cityKey),
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(startsAt));
}

function formatWindowEyebrow(match: TonightHeroData) {
  const windowLabel = match.timeContext.window === "live" ? "LIVE NOW" : match.timeContext.window.toUpperCase();
  return `${windowLabel} · ${formatKickoffLabel(match.startsAt, match.cityKey)}`;
}

function getPrimaryCountrySlug(match: TonightHeroData) {
  return match.homeCountry.slug;
}

export function AliveMatchCard({ match, variant = "default" }: AliveMatchCardProps) {
  const router = useRouter();
  const href = `/${match.cityKey}/map?match=${match.matchId}&country=${getPrimaryCountrySlug(match)}`;
  const hasVenueCount = match.venueCount > 0;

  return (
    <button
      type="button"
      onClick={() => {
        trackAliveMatchCardCtaClick({ matchId: match.matchId, cityKey: match.cityKey });
        router.push(href);
      }}
      aria-label={`${match.homeCountry.name} versus ${match.awayCountry.name} in ${match.cityKey}. ${hasVenueCount ? `${match.venueCount} venues showing.` : "Browse the map."}`}
      className={`surface flex h-full flex-col justify-between p-4 transition hover:-translate-y-0.5 ${
        match.isUserMatch ? "border-gold" : "border-line"
      } ${variant === "compact" ? "min-w-[16rem]" : "w-full"}`}
    >
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-mist">
          {formatWindowEyebrow(match)}
          {match.isUserMatch ? <span className="text-gold"> · YOUR TEAM</span> : null}
        </div>
        <h3 className="mt-3 text-xl font-bold tracking-tight text-deep">
          <span>{match.homeCountry.flagEmoji}</span>
          <span className="mx-2">{match.homeCountry.name}</span>
          <span className="text-mist">v</span>
          <span className="mx-2">{match.awayCountry.name}</span>
          <span>{match.awayCountry.flagEmoji}</span>
        </h3>
        <div className="mt-3 text-sm font-medium text-[color:var(--fg-primary)]">
          {match.timeContext.window === "live" ? "Match in progress" : <LiveCountdown startsAt={match.startsAt} />}
        </div>
        {hasVenueCount ? (
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-[color:var(--fg-secondary)]">
            <span>{match.venueCount} venues showing</span>
            <span>•</span>
            <span>{match.projectedGoingCount}+ fans lining up</span>
          </div>
        ) : null}
        {hasVenueCount ? (
          <div className="mt-2 text-sm font-medium text-deep">{match.crowdSignalCopy} — show up early.</div>
        ) : null}
        {variant === "default" ? (
          <div className="mt-3">
            <CrowdNeighborhoodPill neighborhood={match.topNeighborhood?.name ?? null} />
          </div>
        ) : null}
      </div>
      <div className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)]">
        {hasVenueCount ? "Find a spot →" : "Browse the map →"}
      </div>
    </button>
  );
}
