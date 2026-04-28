// Activity section for /me showing the Elite-only locked state until live redemption history exists.
"use client";

import Link from "next/link";
import type { MembershipTier } from "@/lib/store/membership";

export function MyActivity({
  tier
}: {
  tier: MembershipTier;
}) {
  const locked = tier !== "elite";

  return (
    <section className="surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Activity</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-deep">Your match-day timeline</h2>
          <p className="mt-2 text-sm text-mist">Venue visits, QR claims, and redeemed perks all show up here.</p>
        </div>
        {locked ? (
          <Link href="/membership?feature=match_alerts&return=%2Fme" className="inline-flex min-h-11 items-center rounded-full border border-gold/50 bg-gold/10 px-4 text-sm font-semibold text-deep">
            Unlock with Elite →
          </Link>
        ) : null}
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface-2 p-5">
        {locked ? (
          <div className="text-sm text-mist">Elite members see redemptions, venue visits, and supporter activity in one timeline.</div>
        ) : (
          <div className="text-sm text-mist">No activity yet. Claim a promo or check into a venue and your timeline will start to fill in.</div>
        )}
      </div>
    </section>
  );
}
