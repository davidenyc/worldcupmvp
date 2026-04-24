import L from "leaflet";

import { CountrySummary, RankedVenue } from "@/lib/types";

export function createFlagIcon({
  venue,
  countries,
  selected
}: {
  venue: RankedVenue;
  countries: CountrySummary[];
  selected: boolean;
}) {
  const primary = countries.find((country) => country.slug === venue.associatedCountries[0]);
  const extraCount = Math.max(0, venue.associatedCountries.length - 1);
  const accentColor = primary?.primaryColors[0] ?? "#5eb6ff";

  return L.divIcon({
    className: "",
    html: `
      <div class="flag-marker ${selected ? "is-selected" : ""}" style="--flag-marker-accent: ${accentColor};">
        <span class="flag-marker__flag">${primary?.flagEmoji ?? "📍"}</span>
        ${extraCount ? `<span class="flag-marker__count">+${extraCount}</span>` : ""}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}

export function createClusterIcon(count: number) {
  return L.divIcon({
    className: "",
    html: `<div class="flag-cluster">${count}</div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23]
  });
}
