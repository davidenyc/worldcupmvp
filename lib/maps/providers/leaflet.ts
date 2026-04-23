import { MapProviderConfig } from "@/lib/maps/types";

export const leafletMapProvider: MapProviderConfig = {
  id: "leaflet",
  label: "Leaflet + OSM",
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "&copy; OpenStreetMap contributors",
  defaultCenter: [40.742, -73.968],
  defaultZoom: 10,
  maxZoom: 18
};
