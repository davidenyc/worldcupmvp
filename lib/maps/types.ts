import { BoroughKey, CapacityBucket, CountrySummary, RankedVenue, VenueTypeKey } from "@/lib/types";

export interface MapProviderConfig {
  id: string;
  label: string;
  tileUrl: string;
  darkTileUrl?: string;
  attribution: string;
  defaultCenter: [number, number];
  defaultZoom: number;
  maxZoom: number;
}

export interface ServiceArea {
  key: string;
  label: string;
  shortLabel: string;
  region: string;
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
  richness: "full" | "scaffold";
}

export interface GeoHierarchyNode {
  label: string;
  slug: string;
}

export interface MapFilterState {
  countrySlugs: string[];
  venueType: VenueTypeKey | "";
  borough: BoroughKey | "";
  neighborhood: string;
  acceptsReservations: boolean;
  capacityBucket: CapacityBucket | "";
  familyFriendly: boolean;
  outdoorSeating: boolean;
  showsSoccer: boolean;
  query: string;
}

export type MapSortKey =
  | "matchday"
  | "rating"
  | "capacity"
  | "reservations"
  | "distance";

export interface MapPageData {
  countries: CountrySummary[];
  venues: RankedVenue[];
  neighborhoods: string[];
}

export interface MapCluster {
  id: string;
  venues: RankedVenue[];
  lat: number;
  lng: number;
}
