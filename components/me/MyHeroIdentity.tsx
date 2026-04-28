// Identity hero for the top of /me showing the fan profile, tier, city, and upgrade CTA.
"use client";

import Link from "next/link";
import type { MembershipTier } from "@/lib/store/membership";
import type { UserProfile } from "@/lib/store/user";

const TIER_LABELS: Record<MembershipTier, string> = {
  free: "Free",
  fan: "⭐ Fan Pass",
  elite: "👑 Elite"
};

export function MyHeroIdentity({
  user,
  tier
}: {
  user: UserProfile;
  tier: MembershipTier;
}) {
  const monogram = user.displayName.trim().slice(0, 1).toUpperCase() || "F";

  return (
    <section className="surface p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/12 text-2xl font-black text-deep">
            {monogram}
          </div>
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-mist">My World Cup</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-deep">
              {user.displayName?.trim() ? user.displayName : `Fan #${user.id.slice(0, 4)}`}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface-2 px-4 text-sm font-semibold text-deep">
                {TIER_LABELS[tier]}
              </span>
              <span className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm text-mist">
                Watching from {user.favoriteCity === "nyc" ? "New York" : user.favoriteCity} · change
              </span>
            </div>
          </div>
        </div>

        {tier === "free" ? (
          <Link
            href="/membership?feature=unlimited_saves&return=%2Fme"
            className="inline-flex min-h-11 max-w-xl items-center rounded-2xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm font-semibold text-deep"
          >
            Upgrade to Fan Pass — $4.99/mo · Save unlimited venues, follow every nation, unlimited promo redemptions →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
