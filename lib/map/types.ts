export interface MapVenueMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface MapAdapter {
  id: string;
  label: string;
  getStaticEmbedUrl?: (markers: MapVenueMarker[]) => string | null;
}
