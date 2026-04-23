"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";

import { VenuePreviewCard } from "@/components/map/VenuePreviewCard";
import { leafletMapProvider } from "@/lib/maps/providers/leaflet";
import { CountrySummary, RankedVenue } from "@/lib/types";

const NYC_CENTER: [number, number] = [40.742, -73.968];
const NYC_ZOOM = 11;

function createFlagPinIcon(flagEmoji: string, selected: boolean, shouldAnimate: boolean) {
  return L.divIcon({
    className: "",
    html: `
      <div class="flag-pin ${selected ? "is-selected" : ""} ${shouldAnimate ? "animate-fade-in" : ""}">
        <div class="flag-pin__flag-shell">
          <span class="flag-pin__flag">${flagEmoji}</span>
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

export function NYCFlagPinMap({
  venues,
  countries,
  selectedVenueId,
  onSelectVenue,
  onMapChanged,
  heightClassName = "h-[520px]"
}: {
  venues: RankedVenue[];
  countries: CountrySummary[];
  selectedVenueId?: string;
  onSelectVenue?: (venue: RankedVenue) => void;
  onMapChanged?: (center: [number, number], zoom: number) => void;
  heightClassName?: string;
}) {
  const [openVenueId, setOpenVenueId] = useState<string | null>(selectedVenueId ?? null);
  const [animatedVenueIds, setAnimatedVenueIds] = useState<string[]>([]);
  const countryLookup = useMemo(
    () => new Map(countries.map((country) => [country.slug, country])),
    [countries]
  );
  const previousVenueIdsRef = useRef<string[]>(venues.map((venue) => venue.id));

  useEffect(() => {
    setOpenVenueId(selectedVenueId ?? null);
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
    <div className={`surface-strong overflow-hidden p-2 ${heightClassName}`}>
      <MapContainer
        center={NYC_CENTER}
        zoom={NYC_ZOOM}
        scrollWheelZoom
        dragging
        touchZoom
        className="h-full w-full"
      >
        <TileLayer attribution={leafletMapProvider.attribution} url={leafletMapProvider.tileUrl} />
        <MapEvents onMove={onMapChanged} />
        {venues.map((venue) => {
          const flagEmoji = venue.likelySupporterCountry
            ? countryLookup.get(venue.likelySupporterCountry)?.flagEmoji ?? "📍"
            : "📍";
          const selected = selectedVenueId === venue.id || openVenueId === venue.id;
          const shouldAnimate = animatedVenueIds.includes(venue.id);

          return (
            <Marker
              key={venue.id}
              position={[venue.lat, venue.lng]}
              icon={createFlagPinIcon(flagEmoji, selected, shouldAnimate)}
              eventHandlers={{
                click: () => {
                  setOpenVenueId(venue.id);
                  onSelectVenue?.(venue);
                }
              }}
            >
              <Popup
                closeButton={false}
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
