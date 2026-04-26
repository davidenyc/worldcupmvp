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

function isNeutralSportsBar(venue: RankedVenue) {
  return (
    (venue.venueIntent === "sports_bar" || (venue.venueTypes as string[]).includes("sports_bar")) &&
    !venue.likelySupporterCountry
  );
}

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
  compact: boolean,
  slug?: string,
  fallbackCode?: string
) {
  const iconWidth = compact ? 30 : 40;
  const iconHeight = compact ? 36 : 48;
  const iconAnchorX = compact ? 15 : 20;
  const iconAnchorY = compact ? 33 : 44;
  const popupAnchorY = compact ? -24 : -32;

  return L.divIcon({
    className: "",
    html: `
        <div class="flag-pin ${compact ? "is-compact" : ""} ${selected ? "is-selected" : ""} ${shouldAnimate ? "animate-fade-in" : ""}" style="--flag-pin-accent: ${accentColor};">
        <div class="flag-pin__flag-shell">
          ${renderFlagPinInner(flagEmoji, slug, fallbackCode)}
        </div>
        <span class="flag-pin__dot"></span>
      </div>
    `,
    iconSize: [iconWidth, iconHeight],
    iconAnchor: [iconAnchorX, iconAnchorY],
    popupAnchor: [0, popupAnchorY]
  });
}

function MapEvents({
  onMove,
  onBackgroundClick
}: {
  onMove?: (center: [number, number], zoom: number) => void;
  onBackgroundClick?: () => void;
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
    },
    click() {
      onBackgroundClick?.();
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
  initialCenter = NYC_CENTER,
  initialZoom = NYC_ZOOM,
  selectedVenueId,
  activeCountrySlug,
  activeVenueIntent,
  activeVenueType,
  reservationsOnly,
  openNowOnly,
  highAtmosphereOnly,
  onSelectVenue,
  onClearSelection,
  onToggleCountry,
  onToggleVenueIntent,
  onToggleVenueType,
  onToggleReservations,
  onToggleOpenNow,
  onToggleHighAtmosphere,
  onMapChanged,
  onMapReady,
  heightClassName = "h-[520px]",
  compactMarkers = false
}: {
  venues: RankedVenue[];
  countries: CountrySummary[];
  initialCenter?: [number, number];
  initialZoom?: number;
  selectedVenueId?: string;
  activeCountrySlug?: string | null;
  activeVenueIntent?: RankedVenue["venueIntent"] | null;
  activeVenueType?: string;
  reservationsOnly?: boolean;
  openNowOnly?: boolean;
  highAtmosphereOnly?: boolean;
  onSelectVenue?: (venue: RankedVenue) => void;
  onClearSelection?: () => void;
  onToggleCountry?: (slug: string) => void;
  onToggleVenueIntent?: (intent: RankedVenue["venueIntent"]) => void;
  onToggleVenueType?: (venueType: string) => void;
  onToggleReservations?: () => void;
  onToggleOpenNow?: () => void;
  onToggleHighAtmosphere?: () => void;
  onMapChanged?: (center: [number, number], zoom: number) => void;
  onMapReady?: (map: L.Map) => void;
  heightClassName?: string;
  compactMarkers?: boolean;
}) {
  const [animatedVenueIds, setAnimatedVenueIds] = useState<string[]>([]);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const { isDark } = useTheme();
  const countryLookup = useMemo(
    () => new Map(countries.map((country) => [country.slug, country])),
    [countries]
  );
  const previousVenueIdsRef = useRef<string[]>(venues.map((venue) => venue.id));

  useEffect(() => {
    if (!selectedVenueId) return;
    let frameId = 0;
    let timeoutId = 0;

    const tryOpenPopup = () => {
      const marker = markerRefs.current[selectedVenueId];
      if (!marker) return false;
      marker.openPopup();
      return true;
    };

    if (!tryOpenPopup()) {
      frameId = window.requestAnimationFrame(() => {
        if (tryOpenPopup()) return;
        timeoutId = window.setTimeout(() => {
          tryOpenPopup();
        }, 120);
      });
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [selectedVenueId, venues]);

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
        center={initialCenter}
        zoom={initialZoom}
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
        <MapEvents
          onMove={onMapChanged}
          onBackgroundClick={() => {
            onClearSelection?.();
          }}
        />
        {venues.map((venue) => {
          const country = venue.likelySupporterCountry ? countryLookup.get(venue.likelySupporterCountry) : null;
          const neutralSportsBar = isNeutralSportsBar(venue);
          const flagEmoji = country?.flagEmoji ?? "📍";
          const accentColor = country?.primaryColors[0] ?? (neutralSportsBar ? "#f4b942" : "#16324f");
          const selected = selectedVenueId === venue.id;
          const shouldAnimate = animatedVenueIds.includes(venue.id);

          return (
            <Marker
              key={venue.id}
              position={[venue.lat, venue.lng]}
              icon={createFlagPinIcon(
                flagEmoji,
                selected,
                shouldAnimate,
                accentColor,
                compactMarkers,
                country?.slug,
                country?.fifaCode
              )}
              ref={(marker) => {
                markerRefs.current[venue.id] = marker;
              }}
              eventHandlers={{
                click: (event) => {
                  if ("originalEvent" in event && event.originalEvent) {
                    L.DomEvent.stopPropagation(event.originalEvent);
                  }
                  onSelectVenue?.(venue);
                }
              }}
            >
              <Popup
                autoPan={false}
                closeButton={false}
                keepInView={false}
              >
                <VenuePreviewCard
                  venue={venue}
                  countries={countries}
                  activeCountrySlug={activeCountrySlug}
                  activeVenueIntent={activeVenueIntent}
                  activeVenueType={activeVenueType}
                  reservationsOnly={reservationsOnly}
                  openNowOnly={openNowOnly}
                  highAtmosphereOnly={highAtmosphereOnly}
                  onToggleCountry={onToggleCountry}
                  onToggleVenueIntent={onToggleVenueIntent}
                  onToggleVenueType={onToggleVenueType}
                  onToggleReservations={onToggleReservations}
                  onToggleOpenNow={onToggleOpenNow}
                  onToggleHighAtmosphere={onToggleHighAtmosphere}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
