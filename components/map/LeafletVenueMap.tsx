"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

import { createClusterIcon } from "@/lib/maps/markerFactory";
import { MapCluster, MapProviderConfig } from "@/lib/maps/types";
import { CountrySummary, RankedVenue } from "@/lib/types";
import { VenuePreviewCard } from "@/components/map/VenuePreviewCard";
import { FlagMarker } from "@/components/map/FlagMarker";
import { useTheme } from "@/lib/store/theme";

function clusterVenues(venues: RankedVenue[], zoom: number): MapCluster[] {
  const threshold = zoom <= 10 ? 0.03 : zoom <= 12 ? 0.015 : 0.008;
  const clusters: MapCluster[] = [];

  venues.forEach((venue) => {
    const existing = clusters.find((cluster) => {
      const latDiff = Math.abs(cluster.lat - venue.lat);
      const lngDiff = Math.abs(cluster.lng - venue.lng);
      return latDiff <= threshold && lngDiff <= threshold;
    });

    if (existing) {
      existing.venues.push(venue);
      existing.lat =
        existing.venues.reduce((sum, item) => sum + item.lat, 0) / existing.venues.length;
      existing.lng =
        existing.venues.reduce((sum, item) => sum + item.lng, 0) / existing.venues.length;
    } else {
      clusters.push({
        id: venue.id,
        venues: [venue],
        lat: venue.lat,
        lng: venue.lng
      });
    }
  });

  return clusters;
}

function MapSync({
  center,
  zoom,
  selectedVenue,
  onMapChanged
}: {
  center: [number, number];
  zoom: number;
  selectedVenue?: RankedVenue | null;
  onMapChanged: (center: [number, number], zoom: number) => void;
}) {
  const map = useMap();

  useMapEvents({
    moveend() {
      const center = map.getCenter();
      onMapChanged([center.lat, center.lng], map.getZoom());
    },
    zoomend() {
      const center = map.getCenter();
      onMapChanged([center.lat, center.lng], map.getZoom());
    }
  });

  useEffect(() => {
    if (!selectedVenue) return;
    map.flyTo([selectedVenue.lat, selectedVenue.lng], Math.max(map.getZoom(), 14), {
      duration: 0.55
    });
  }, [map, selectedVenue]);

  useEffect(() => {
    const current = map.getCenter();
    const currentZoom = map.getZoom();
    const sameCenter =
      Math.abs(current.lat - center[0]) < 0.0001 && Math.abs(current.lng - center[1]) < 0.0001;
    if (!sameCenter || currentZoom !== zoom) {
      map.flyTo(center, zoom, { duration: 0.45 });
    }
  }, [center, map, zoom]);

  return null;
}

function ThemeTileLayer({
  provider,
  isDark
}: {
  provider: MapProviderConfig;
  isDark: boolean;
}) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);
  const tileUrl = isDark && provider.darkTileUrl ? provider.darkTileUrl : provider.tileUrl;

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    layerRef.current = L.tileLayer(tileUrl, {
      attribution: provider.attribution
    }).addTo(map);

    map.invalidateSize();
  }, [isDark, map, provider.attribution, tileUrl]);

  useEffect(
    () => () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    },
    [map]
  );

  return null;
}

export function LeafletVenueMap({
  provider,
  countries,
  venues,
  selectedVenue,
  onSelectVenue,
  center,
  zoom,
  onMapChanged,
  heightClassName = "h-[70vh]"
}: {
  provider: MapProviderConfig;
  countries: CountrySummary[];
  venues: RankedVenue[];
  selectedVenue?: RankedVenue | null;
  onSelectVenue: (venue: RankedVenue) => void;
  center: [number, number];
  zoom: number;
  onMapChanged: (center: [number, number], zoom: number) => void;
  heightClassName?: string;
}) {
  const clusters = useMemo(() => clusterVenues(venues, zoom), [venues, zoom]);
  const { isDark } = useTheme();

  return (
    <div className={`surface-strong overflow-hidden p-2 ${heightClassName}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <ThemeTileLayer provider={provider} isDark={isDark} />
        <MapSync center={center} zoom={zoom} selectedVenue={selectedVenue} onMapChanged={onMapChanged} />
        {clusters.map((cluster) =>
          cluster.venues.length === 1 ? (
            <FlagMarker
              key={cluster.id}
              venue={cluster.venues[0]}
              countries={countries}
              selected={selectedVenue?.id === cluster.venues[0].id}
              onSelect={onSelectVenue}
            />
          ) : (
            <Marker
              key={cluster.id}
              position={[cluster.lat, cluster.lng]}
              icon={createClusterIcon(cluster.venues.length)}
              eventHandlers={{
                click: () => onSelectVenue(cluster.venues[0])
              }}
            >
              <Popup closeButton={false}>
                <div className="min-w-[220px] p-2">
                  <div className="text-sm font-semibold text-deep">
                    {cluster.venues.length} venues in this cluster
                  </div>
                  <div className="mt-2 space-y-2">
                    {cluster.venues.slice(0, 4).map((venue) => (
                      <VenuePreviewCard key={venue.id} venue={venue} countries={countries} />
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        )}
      </MapContainer>
    </div>
  );
}
