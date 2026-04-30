import { MapProviderConfig } from "@/lib/maps/types";

export const leafletMapProvider: MapProviderConfig = {
  id: "leaflet",
  label: "CARTO Voyager",
  tileUrl: "/api/map-tiles/carto-voyager/{z}/{x}/{y}{r}.png",
  darkTileUrl: "/api/map-tiles/carto-dark/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  defaultCenter: [40.742, -73.968],
  defaultZoom: 11,
  maxZoom: 19
};
