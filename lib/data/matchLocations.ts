import { HOST_CITIES } from "@/lib/data/hostCities";

export const HOST_CITY_STADIUMS: Record<string, string> = {
  nyc: "MetLife Stadium",
  "los-angeles": "SoFi Stadium",
  dallas: "AT&T Stadium",
  miami: "Hard Rock Stadium",
  atlanta: "Mercedes-Benz Stadium",
  houston: "NRG Stadium",
  "san-francisco": "Levi's Stadium",
  seattle: "Lumen Field",
  boston: "Gillette Stadium",
  philadelphia: "Lincoln Financial Field",
  "kansas-city": "Arrowhead Stadium",
  "las-vegas": "Allegiant Stadium",
  toronto: "BMO Field",
  vancouver: "BC Place",
  "mexico-city": "Estadio Azteca",
  guadalajara: "Estadio Akron",
  monterrey: "Estadio Universitario"
};

export const MATCH_STADIUM_TO_HOST_CITY_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(HOST_CITY_STADIUMS).map(([cityKey, stadiumName]) => [stadiumName, cityKey])
);

export const MATCH_CITY_STATE: Record<string, string> = {
  "East Rutherford": "NJ",
  "Foxborough": "MA",
  "Santa Clara": "CA",
  "Inglewood": "CA",
  "Arlington": "TX",
  "Miami Gardens": "FL",
  "Atlanta": "GA",
  "Houston": "TX",
  "Philadelphia": "PA",
  "Kansas City": "MO",
  "Seattle": "WA",
  "Vancouver": "BC",
  "Toronto": "ON",
  "Mexico City": "CDMX",
  "Zapopan": "JAL",
  "Guadalupe": "NL"
};

export function getMatchHostCityKey(match: { stadiumName: string }) {
  return MATCH_STADIUM_TO_HOST_CITY_KEY[match.stadiumName] ?? null;
}

export function getMatchHostCityLabel(match: { stadiumName: string; city: string }) {
  const key = getMatchHostCityKey(match);
  if (!key) return match.city;
  return HOST_CITIES.find((city) => city.key === key)?.label ?? match.city;
}

export function getMatchLocationLabel(match: { city: string }) {
  const state = MATCH_CITY_STATE[match.city];
  return state ? `${match.city} ${state}` : match.city;
}

export function getHostCityStadiumLabel(cityKey: string) {
  return HOST_CITY_STADIUMS[cityKey] ?? "";
}
