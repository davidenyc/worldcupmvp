export interface HostCity {
  key: string;
  label: string;
  shortLabel: string;
  state: string;
  lat: number;
  lng: number;
  stadiumName: string;
  country: "usa" | "canada" | "mexico";
}

export const HOST_CITIES: HostCity[] = [
  { key: "nyc", label: "New York", shortLabel: "NYC", state: "NY", lat: 40.742, lng: -73.968, stadiumName: "MetLife Stadium", country: "usa" },
  { key: "los-angeles", label: "Los Angeles", shortLabel: "LA", state: "CA", lat: 34.052, lng: -118.243, stadiumName: "SoFi Stadium", country: "usa" },
  { key: "dallas", label: "Dallas", shortLabel: "DAL", state: "TX", lat: 32.776, lng: -96.796, stadiumName: "AT&T Stadium", country: "usa" },
  { key: "san-francisco", label: "San Francisco", shortLabel: "SF", state: "CA", lat: 37.338, lng: -121.886, stadiumName: "Levi's Stadium", country: "usa" },
  { key: "miami", label: "Miami", shortLabel: "MIA", state: "FL", lat: 25.761, lng: -80.191, stadiumName: "Hard Rock Stadium", country: "usa" },
  { key: "seattle", label: "Seattle", shortLabel: "SEA", state: "WA", lat: 47.606, lng: -122.332, stadiumName: "Lumen Field", country: "usa" },
  { key: "boston", label: "Boston", shortLabel: "BOS", state: "MA", lat: 42.36, lng: -71.058, stadiumName: "Gillette Stadium", country: "usa" },
  { key: "philadelphia", label: "Philadelphia", shortLabel: "PHI", state: "PA", lat: 39.952, lng: -75.163, stadiumName: "Lincoln Financial Field", country: "usa" },
  { key: "kansas-city", label: "Kansas City", shortLabel: "KC", state: "MO", lat: 39.099, lng: -94.578, stadiumName: "Arrowhead Stadium", country: "usa" },
  { key: "atlanta", label: "Atlanta", shortLabel: "ATL", state: "GA", lat: 33.748, lng: -84.387, stadiumName: "Mercedes-Benz Stadium", country: "usa" },
  { key: "houston", label: "Houston", shortLabel: "HOU", state: "TX", lat: 29.76, lng: -95.369, stadiumName: "NRG Stadium", country: "usa" },
  { key: "las-vegas", label: "Las Vegas", shortLabel: "LV", state: "NV", lat: 36.174, lng: -115.137, stadiumName: "Allegiant Stadium", country: "usa" },
  { key: "toronto", label: "Toronto", shortLabel: "TOR", state: "ON", lat: 43.6532, lng: -79.3832, stadiumName: "BMO Field", country: "canada" },
  { key: "vancouver", label: "Vancouver", shortLabel: "VAN", state: "BC", lat: 49.2827, lng: -123.1207, stadiumName: "BC Place", country: "canada" },
  { key: "mexico-city", label: "Mexico City", shortLabel: "MEX", state: "CDMX", lat: 19.4326, lng: -99.1332, stadiumName: "Estadio Azteca", country: "mexico" },
  { key: "guadalajara", label: "Guadalajara", shortLabel: "GDL", state: "JAL", lat: 20.6597, lng: -103.3496, stadiumName: "Estadio Akron", country: "mexico" },
  { key: "monterrey", label: "Monterrey", shortLabel: "MTY", state: "NL", lat: 25.6866, lng: -100.3161, stadiumName: "Estadio Universitario", country: "mexico" }
];

const HOST_CITY_LOOKUP = new Map(
  HOST_CITIES.flatMap((city) => [
    [city.key, city],
    [city.label.toLowerCase(), city],
    [city.label.toLowerCase().replace(/\s+/g, "-"), city]
  ])
);

export function getHostCity(value?: string | null) {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();
  return HOST_CITY_LOOKUP.get(normalized) ?? HOST_CITIES.find((city) => city.key === normalized) ?? null;
}
