import { MapProviderConfig } from "@/lib/maps/types";

// TODO: Swap in Google Maps JS provider once credentials and display rules are configured.
export const googleMapProvider: MapProviderConfig = {
  id: "google",
  label: "Google Maps",
  tileUrl: "",
  attribution: "Google Maps",
  defaultCenter: [40.742, -73.968],
  defaultZoom: 10,
  maxZoom: 18
};
