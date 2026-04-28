// Identity hero for the top of /me showing the fan profile, tier, city, and upgrade CTA.
"use client";

import Link from "next/link";
import type { MembershipTier } from "@/lib/store/membership";
import type { UserProfile } from "@/lib/store/user";

const TIER_LABELS: Record<MembershipTier, string> = {
  free: "Free",
  fan: "Fan Pass",
  elite: "Elite"
};

const TIER_STYLES: Record<MembershipTier, string> = {
  free: "border-line bg-surface text-deep",
  fan: "border-gold/50 bg-gold/12 text-deep",
  elite: "border-fuchsia-400/40 bg-fuchsia-500/12 text-deep dark:text-white"
};

export function MyHeroIdentity({
  user,
  tier
}: {
  user: UserProfile;
  tier: MembershipTier;
}) {
  const monogram = user.displayName.trim().slice(0, 1).toUpperCase() || "F";
  const firstName = user.displayName?.trim() ? user.displayName.trim().split(/\s+/)[0] : "Fan";

  return (
    <section className="overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(circle_at_top_left,rgba(244,185,66,0.18),transparent_38%),linear-gradient(145deg,var(--bg-surface),var(--bg-surface-elevated))] p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-[#12233f] text-3xl font-black text-gold">
            {monogram}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-mist">My Cup</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-deep">
              Welcome back, {firstName}.
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {tier === "free" ? (
                <Link
                  href="/membership?feature=unlimited_saves&return=%2Fme"
                  className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold ${TIER_STYLES[tier]}`}
                >
                  {TIER_LABELS[tier]}
                </Link>
              ) : (
                <span className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold ${TIER_STYLES[tier]}`}>
                  {TIER_LABELS[tier]}
                </span>
              )}
              <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm text-mist">
                Watching from {user.favoriteCity === "nyc" ? "New York" : user.favoriteCity} · change
              </span>
            </div>
            <p className="mt-3 text-sm text-mist">
              Your saved spots, watchlist, and promos all stay together here.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Link
            href="/account"
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
          >
            Edit profile →
          </Link>
          {tier === "free" ? (
            <Link
              href="/membership?feature=unlimited_saves&return=%2Fme"
              className="inline-flex min-h-11 max-w-xl items-center rounded-2xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm font-semibold text-deep"
            >
              Upgrade to Fan Pass — save unlimited venues and promos →
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
