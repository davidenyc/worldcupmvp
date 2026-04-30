"use client";

import Link from "next/link";

import { useUserCity } from "@/lib/hooks/useUserCity";

export function MarketingHeroActions({ variant = "hero" }: { variant?: "hero" | "compact" }) {
  const { activeCity } = useUserCity();
  const cityKey = activeCity || "nyc";
  const primaryHref = "/welcome";
  const secondaryHref = `/today?city=${cityKey}`;
  const tertiaryHref = `/${cityKey}/map`;

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-3">
        <Link
          href={secondaryHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-deep transition hover:bg-surface-2"
        >
          See the slate →
        </Link>
        <Link
          href={tertiaryHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-[color:var(--fg-on-accent)]"
        >
          Browse the map →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 flex max-w-sm flex-col gap-3 sm:mt-8">
      <Link
        href={primaryHref}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-[color:var(--fg-on-accent)] transition hover:brightness-95"
      >
        Personalize My Cup →
      </Link>
      <Link
        href={secondaryHref}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-[color:var(--fg-on-strong)] transition hover:bg-white/10"
      >
        See the slate →
      </Link>
    </div>
  );
}
