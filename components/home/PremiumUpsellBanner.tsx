"use client";

import Link from "next/link";

import { useMembership } from "@/lib/store/membership";

export function PremiumUpsellBanner() {
  const tier = useMembership((state) => state.tier);

  if (tier === "elite") return null;

  return (
    <div className="my-12 rounded-3xl bg-deep p-8 text-center">
      <div className="text-3xl">⭐</div>
      <h3 className="mt-3 text-2xl font-bold text-[color:var(--fg-on-strong)]">Go Premium for the World Cup</h3>
      <p className="mt-2 mb-5 text-[color:var(--fg-secondary-on-strong)]">
        Unlock all 48 country filters, save unlimited venues, and get reservation access at every bar in our network.
      </p>
      <Link
        href="/membership"
        className="inline-flex rounded-full bg-gold px-8 py-3 text-base font-bold text-deep"
      >
        See Fan Pass & Elite Plans
      </Link>
      <div className="mt-3 text-xs text-[color:var(--fg-on-strong)]/30">Unlock Fan Pass perks before kickoff</div>
    </div>
  );
}
