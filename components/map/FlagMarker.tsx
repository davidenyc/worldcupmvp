"use client";

import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";

import { createFlagIcon } from "@/lib/maps/markerFactory";
import { CountrySummary, RankedVenue } from "@/lib/types";
import { VenuePreviewCard } from "@/components/map/VenuePreviewCard";

export function FlagMarker({
  venue,
  countries,
  selected,
  onSelect
}: {
  venue: RankedVenue;
  countries: CountrySummary[];
  selected: boolean;
  onSelect: (venue: RankedVenue) => void;
}) {
  const icon = useMemo(
    () => createFlagIcon({ venue, countries, selected }),
    [countries, selected, venue]
  );

  return (
    <Marker
      position={[venue.lat, venue.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(venue),
        mouseover: () => onSelect(venue)
      }}
    >
      <Popup closeButton={false} offset={[0, 14]}>
        <VenuePreviewCard venue={venue} countries={countries} />
      </Popup>
    </Marker>
  );
}
