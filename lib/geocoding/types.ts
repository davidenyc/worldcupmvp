export interface GeocodeResult {
  lat: number;
  lng: number;
  confidence: "high" | "medium" | "low";
  provider: string;
}

export interface Geocoder {
  geocode(address: string): Promise<GeocodeResult | null>;
}
