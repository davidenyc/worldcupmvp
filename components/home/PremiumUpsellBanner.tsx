"use client";

import Link from "next/link";

import { useMembership } from "@/lib/store/membership";

export function PremiumUpsellBanner() {
  const tier = useMembership((state) => state.tier);

  if (tier === "elite") return null;

  return (
    <div className="my-12 rounded-3xl bg-[#0a1628] p-8 text-center">
      <div className="text-3xl">⭐</div>
      <h3 className="mt-3 text-2xl font-bold text-white">Go Premium for the World Cup</h3>
      <p className="mt-2 mb-5 text-white/60">
        Unlock all 48 country filters, save unlimited venues, and get reservation access at every bar in our network.
      </p>
      <Link
        href="/membership"
        className="inline-flex rounded-full bg-[#f4b942] px-8 py-3 text-base font-bold text-[#0a1628]"
      >
        See Fan Pass & Elite Plans
      </Link>
      <div className="mt-3 text-xs text-white/30">Demo mode — upgrade free today</div>
    </div>
  );
}
