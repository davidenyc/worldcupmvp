"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";

import { VenuePreviewCard } from "@/components/map/VenuePreviewCard";
import { createClusterIcon } from "@/lib/maps/markerFactory";
import { leafletMapProvider } from "@/lib/maps/providers/leaflet";
import { useTheme } from "@/lib/store/theme";
import { CountrySummary, RankedVenue } from "@/lib/types";
import { getFlagImageUrl } from "@/lib/utils/flagImage";

const NYC_CENTER: [number, number] = [40.742, -73.968];
const NYC_ZOOM = 11;
const tapDisabled = { tap: false } as unknown as Record<string, boolean>;

export type NYCFlagPinMapProps = {
  venues: RankedVenue[];
  countries: CountrySummary[];
  promoVenueIds?: string[];
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
};

type VenueCluster = {
  id: string;
  lat: number;
  lng: number;
  venues: RankedVenue[];
};

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
  hasPromo: boolean,
  slug?: string,
  fallbackCode?: string
) {
  const iconWidth = compact ? 36 : 44;
  const iconHeight = compact ? 42 : 54;
  const iconAnchorX = compact ? 18 : 22;
  const iconAnchorY = compact ? 38 : 49;
  const popupAnchorY = compact ? -28 : -34;

  return L.divIcon({
    className: "",
    html: `
        <div class="flag-pin ${compact ? "is-compact" : ""} ${selected ? "is-selected" : ""} ${shouldAnimate ? "animate-fade-in" : ""}" style="--flag-pin-accent: ${accentColor};">
        <div class="flag-pin__flag-shell">
          ${renderFlagPinInner(flagEmoji, slug, fallbackCode)}
        </div>
        ${hasPromo ? '<span class="flag-pin__promo">%</span>' : ""}
        <span class="flag-pin__dot"></span>
      </div>
    `,
    iconSize: [iconWidth, iconHeight],
    iconAnchor: [iconAnchorX, iconAnchorY],
    popupAnchor: [0, popupAnchorY]
  });
}

function clusterVenues(venues: RankedVenue[], zoom: number) {
  if (zoom >= 14) {
    return venues.map((venue) => ({
      id: venue.id,
      lat: venue.lat,
      lng: venue.lng,
      venues: [venue]
    }));
  }

  const threshold = zoom < 11 ? 0.016 : zoom < 12.5 ? 0.011 : 0.007;
  const clusters: VenueCluster[] = [];

  venues.forEach((venue) => {
    const existing = clusters.find((cluster) => {
      const latDiff = Math.abs(cluster.lat - venue.lat);
      const lngDiff = Math.abs(cluster.lng - venue.lng);
      return latDiff <= threshold && lngDiff <= threshold;
    });

    if (existing) {
      existing.venues.push(venue);
      existing.lat = existing.venues.reduce((sum, item) => sum + item.lat, 0) / existing.venues.length;
      existing.lng = existing.venues.reduce((sum, item) => sum + item.lng, 0) / existing.venues.length;
      return;
    }

    clusters.push({
      id: venue.id,
      lat: venue.lat,
      lng: venue.lng,
      venues: [venue]
    });
  });

  return clusters;
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
    map.invalidateSize(false);
    const frameId = window.requestAnimationFrame(() => map.invalidateSize(false));
    const timeoutId = window.setTimeout(() => map.invalidateSize(false), 180);
    onMapReady?.(map);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
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
    const timeoutId = window.setTimeout(() => map.invalidateSize(false), 180);
    return () => window.clearTimeout(timeoutId);
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

export function NYCFlagPinMapClient({
  venues,
  countries,
  promoVenueIds = [],
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
}: NYCFlagPinMapProps) {
  const [animatedVenueIds, setAnimatedVenueIds] = useState<string[]>([]);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const { isDark } = useTheme();
  const countryLookup = useMemo(
    () => new Map(countries.map((country) => [country.slug, country])),
    [countries]
  );
  const promoVenueIdSet = useMemo(() => new Set(promoVenueIds), [promoVenueIds]);
  const clusteredVenues = useMemo(() => clusterVenues(venues, mapZoom), [mapZoom, venues]);
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
        style={{ background: isDark ? "#111827" : "#eef4ff" }}
        {...tapDisabled}
      >
        <MapReadyBridge
          onMapReady={(map) => {
            setMapInstance(map);
            onMapReady?.(map);
          }}
        />
        <ThemeTileLayer isDark={isDark} />
        <MapEvents
          onMove={(center, zoom) => {
            setMapZoom(zoom);
            onMapChanged?.(center, zoom);
          }}
          onBackgroundClick={() => {
            onClearSelection?.();
          }}
        />
        {clusteredVenues.map((cluster) => {
          if (cluster.venues.length > 1) {
            return (
              <Marker
                key={cluster.id}
                position={[cluster.lat, cluster.lng]}
                icon={createClusterIcon(cluster.venues.length)}
                eventHandlers={{
                  click: () => {
                    onClearSelection?.();
                    if (mapInstance) {
                      mapInstance.flyTo([cluster.lat, cluster.lng], Math.min(mapInstance.getZoom() + 2, 15), {
                        duration: 0.4
                      });
                    }
                  }
                }}
              />
            );
          }

          const venue = cluster.venues[0];
          const country = venue.likelySupporterCountry ? countryLookup.get(venue.likelySupporterCountry) : null;
          const neutralSportsBar = isNeutralSportsBar(venue);
          const flagEmoji = country?.flagEmoji ?? "📍";
          const accentColor = country?.primaryColors[0] ?? (neutralSportsBar ? "#f4b942" : "#16324f");
          const selected = selectedVenueId === venue.id;
          const shouldAnimate = animatedVenueIds.includes(venue.id);
          const hasPromo = promoVenueIdSet.has(venue.slug) || promoVenueIdSet.has(venue.id);

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
                hasPromo,
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
