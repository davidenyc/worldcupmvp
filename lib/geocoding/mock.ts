import { Geocoder, GeocodeResult } from "@/lib/geocoding/types";

const neighborhoodLookup: Record<string, GeocodeResult> = {
  manhattan: { lat: 40.7831, lng: -73.9712, confidence: "medium", provider: "mock" },
  brooklyn: { lat: 40.6782, lng: -73.9442, confidence: "medium", provider: "mock" },
  queens: { lat: 40.7282, lng: -73.7949, confidence: "medium", provider: "mock" },
  bronx: { lat: 40.8448, lng: -73.8648, confidence: "medium", provider: "mock" },
  "staten island": {
    lat: 40.5795,
    lng: -74.1502,
    confidence: "medium",
    provider: "mock"
  }
};

export const mockGeocoder: Geocoder = {
  async geocode(address: string) {
    const key = Object.keys(neighborhoodLookup).find((item) =>
      address.toLowerCase().includes(item)
    );
    return key ? neighborhoodLookup[key] : null;
  }
};
