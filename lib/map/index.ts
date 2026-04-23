import { MapAdapter, MapVenueMarker } from "@/lib/map/types";

const mapboxAdapter: MapAdapter = {
  id: "mapbox",
  label: "Mapbox",
  getStaticEmbedUrl(markers: MapVenueMarker[]) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !markers.length) return null;

    const pins = markers
      .slice(0, 8)
      .map((marker) => `pin-s+f4b740(${marker.lng},${marker.lat})`)
      .join(",");

    return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${pins}/-73.96,40.74,10.2,0/900x560?access_token=${token}`;
  }
};

const googleAdapter: MapAdapter = {
  id: "google",
  label: "Google Maps"
};

export function getMapAdapter() {
  const provider = process.env.NEXT_PUBLIC_MAP_PROVIDER ?? "mapbox";
  return provider === "google" ? googleAdapter : mapboxAdapter;
}
