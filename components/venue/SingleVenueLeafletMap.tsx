"use client";

import { useMemo, useState } from "react";
import { NYCFlagPinMap } from "@/components/map/NYCFlagPinMap";
import { CountrySummary, RankedVenue } from "@/lib/types";

export function SingleVenueLeafletMap({
  venue,
  countries
}: {
  venue: RankedVenue;
  countries: CountrySummary[];
}) {
  const [selectedVenue, setSelectedVenue] = useState<RankedVenue | null>(venue);
  const venues = useMemo(() => [venue], [venue]);

  return (
    <div className="surface-strong p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-mist dark:text-white/45">Host-city venue map</div>
          <h3 className="text-2xl font-semibold text-deep dark:text-white">Single venue map</h3>
        </div>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-line dark:border-white/10">
        <NYCFlagPinMap
          venues={venues}
          countries={countries}
          selectedVenueId={selectedVenue?.id}
          onSelectVenue={setSelectedVenue}
          onClearSelection={() => setSelectedVenue(null)}
          heightClassName="h-[380px]"
        />
      </div>
    </div>
  );
}
