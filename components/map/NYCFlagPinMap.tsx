"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, ZoomControl, useMap, useMapEvents } from "react-leaflet";

import { VenuePreviewCard } from "@/components/map/VenuePreviewCard";
import { leafletMapProvider } from "@/lib/maps/providers/leaflet";
import { useTheme } from "@/lib/store/theme";
import { CountrySummary, RankedVenue } from "@/lib/types";
import { getFlagImageUrl } from "@/lib/utils/flagImage";

const NYC_CENTER: [number, number] = [40.742, -73.968];
const NYC_ZOOM = 11;
const tapDisabled = { tap: false } as unknown as Record<string, boolean>;

function renderFlagPinInner(flagEmoji: string, slug?: string, fallbackCode?: string) {
  const flagImageUrl = getFlagImageUrl(slug);
  if (flagImageUrl) {
    return `<img class="h-4 w-6 rounded-[2px] object-cover" src="${flagImageUrl}" alt="${fallbackCode ?? "flag"}" />`;
  }

  const shouldUseCode = flagEmoji.length > 4 || flagEmoji.includes(" ");
  if (shouldUseCode) {
    return `<span class="flag-pin__code">${fallbackCode ?? "FC"}</span>`;
  }

  return `<span class="flag-pin__flag">${flagEmoji}</span>`;
}

function createFlagPinIcon(
  flagEmoji: string,
  selected: boolean,
  shouldAnimate: boolean,
  accentColor: string,
  slug?: string,
  fallbackCode?: string
) {
  return L.divIcon({
    className: "",
    html: `
        <div class="flag-pin ${selected ? "is-selected" : ""} ${shouldAnimate ? "animate-fade-in" : ""}" style="--flag-pin-accent: ${accentColor};">
        <div class="flag-pin__flag-shell">
          ${renderFlagPinInner(flagEmoji, slug, fallbackCode)}
        </div>
        <span class="flag-pin__dot"></span>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 44],
    popupAnchor: [0, -32]
  });
}

function MapEvents({
  onMove
}: {
  onMove?: (center: [number, number], zoom: number) => void;
}) {
  useMapEvents({
    moveend(event) {
      if (!onMove) return;
      const map = event.target;
      const center = map.getCenter();
      onMove([center.lat, center.lng], map.getZoom());
    },
    zoomend(event) {
      if (!onMove) return;
      const map = event.target;
      const center = map.getCenter();
      onMove([center.lat, center.lng], map.getZoom());
    }
  });

  return null;
}

function MapReadyBridge({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();
  const hasReportedRef = useRef(false);

  useEffect(() => {
    if (hasReportedRef.current) return;
    hasReportedRef.current = true;
    onMapReady?.(map);
  }, [map, onMapReady]);

  return null;
}

function ThemeTileLayer({ isDark }: { isDark: boolean }) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);
  const tileUrl = isDark && leafletMapProvider.darkTileUrl ? leafletMapProvider.darkTileUrl : leafletMapProvider.tileUrl;

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    layerRef.current = L.tileLayer(tileUrl, {
      attribution: leafletMapProvider.attribution
    }).addTo(map);

    map.invalidateSize();
  }, [map, tileUrl]);

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

export function NYCFlagPinMap({
  venues,
  countries,
  selectedVenueId,
  onSelectVenue,
  onMapChanged,
  onMapReady,
  heightClassName = "h-[520px]"
}: {
  venues: RankedVenue[];
  countries: CountrySummary[];
  selectedVenueId?: string;
  onSelectVenue?: (venue: RankedVenue) => void;
  onMapChanged?: (center: [number, number], zoom: number) => void;
  onMapReady?: (map: L.Map) => void;
  heightClassName?: string;
}) {
  const [openVenueId, setOpenVenueId] = useState<string | null>(selectedVenueId ?? null);
  const [animatedVenueIds, setAnimatedVenueIds] = useState<string[]>([]);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const { isDark } = useTheme();
  const countryLookup = useMemo(
    () => new Map(countries.map((country) => [country.slug, country])),
    [countries]
  );
  const previousVenueIdsRef = useRef<string[]>(venues.map((venue) => venue.id));

  useEffect(() => {
    setOpenVenueId(selectedVenueId ?? null);
  }, [selectedVenueId]);

  useEffect(() => {
    if (!selectedVenueId) return;
    const marker = markerRefs.current[selectedVenueId];
    marker?.openPopup();
  }, [selectedVenueId]);

  useEffect(() => {
    const previousIds = previousVenueIdsRef.current;
    const currentIds = venues.map((venue) => venue.id);
    const hasExpanded = currentIds.length > previousIds.length;
    const newIds = hasExpanded ? currentIds.filter((id) => !previousIds.includes(id)) : [];

    setAnimatedVenueIds(newIds);
    previousVenueIdsRef.current = currentIds;

    if (!newIds.length) return;

    const timeout = window.setTimeout(() => {
      setAnimatedVenueIds([]);
    }, 320);

    return () => window.clearTimeout(timeout);
  }, [venues]);

  return (
    <div className={`overflow-hidden ${heightClassName}`}>
      <MapContainer
        center={NYC_CENTER}
        zoom={NYC_ZOOM}
        scrollWheelZoom
        dragging
        touchZoom
        zoomControl={false}
        className="h-full w-full"
        {...tapDisabled}
      >
        <MapReadyBridge onMapReady={onMapReady} />
        <ZoomControl position="bottomright" />
        <ThemeTileLayer isDark={isDark} />
        <MapEvents onMove={onMapChanged} />
        {venues.map((venue) => {
          const country = venue.likelySupporterCountry ? countryLookup.get(venue.likelySupporterCountry) : null;
          const flagEmoji = country?.flagEmoji ?? "📍";
          const accentColor = country?.primaryColors[0] ?? "#16324f";
          const selected = selectedVenueId === venue.id || openVenueId === venue.id;
          const shouldAnimate = animatedVenueIds.includes(venue.id);

          return (
            <Marker
              key={venue.id}
              position={[venue.lat, venue.lng]}
              icon={createFlagPinIcon(flagEmoji, selected, shouldAnimate, accentColor, country?.slug, country?.fifaCode)}
              ref={(marker) => {
                markerRefs.current[venue.id] = marker;
              }}
              eventHandlers={{
                click: () => {
                  setOpenVenueId(venue.id);
                  onSelectVenue?.(venue);
                }
              }}
            >
              <Popup
                eventHandlers={{
                  remove: () => {
                    setOpenVenueId((current) => (current === venue.id ? null : current));
                  }
                }}
              >
                <VenuePreviewCard venue={venue} countries={countries} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
