import type { RankedVenue } from "@/lib/types";

import { getCrowdSignal } from "@/lib/social/crowdSignals";
import { getSeededGoingCount } from "@/lib/social/seededGoingCount";

interface SeededGoingChipProps {
  matchId: string;
  venueSlug: string;
  venue: RankedVenue;
}

export function SeededGoingChip({ matchId, venueSlug, venue }: SeededGoingChipProps) {
  const count = getSeededGoingCount(matchId, venueSlug, venue);
  const signal = getCrowdSignal(count, venue.capacityBucket);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-[var(--bg-surface-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--fg-primary)] ${
        signal.pulse ? "animate-pulse motion-reduce:animate-none" : ""
      }`}
    >
      {count} going · {signal.copy.toLowerCase()}
    </span>
  );
}
