"use client";

import Link from "next/link";

import { trackVibeChipTap } from "@/lib/analytics/track";
import { vibeFilters } from "@/lib/data/vibeFilters";

interface VibeChipsProps {
  cityKey: string;
}

export function VibeChips({ cityKey }: VibeChipsProps) {
  return (
    <section>
      <div className="text-[11px] uppercase tracking-[0.2em] text-mist">What's your vibe tonight?</div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 sm:flex-wrap">
        {vibeFilters.map((filter) => (
          <Link
            key={filter.slug}
            href={`/${cityKey}/map?vibe=${filter.slug}`}
            onClick={() => trackVibeChipTap({ vibe: filter.slug, cityKey })}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-[var(--bg-surface)] px-4 text-sm font-semibold text-deep transition hover:border-gold hover:ring-2 hover:ring-gold/30"
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
