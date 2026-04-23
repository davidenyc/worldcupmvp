import { ServiceArea } from "@/lib/maps/types";

// NYC-only coverage. The spec is explicit: all other metros should be removed
// from the map UI. Bounds include Manhattan, Brooklyn, Queens, Bronx, Staten
// Island, plus Jersey City and Hoboken on the NJ waterfront.
export const serviceAreas: ServiceArea[] = [
  {
    key: "nyc",
    label: "New York City",
    shortLabel: "NYC",
    region: "NYC Metro",
    center: [40.742, -73.968],
    zoom: 11,
    bounds: [
      [40.56, -74.22],
      [40.92, -73.68]
    ],
    richness: "full"
  }
];
