export const CITY_TIMEZONES: Record<string, string> = {
  nyc: "America/New_York",
  "los-angeles": "America/Los_Angeles",
  dallas: "America/Chicago",
  "san-francisco": "America/Los_Angeles",
  miami: "America/New_York",
  seattle: "America/Los_Angeles",
  boston: "America/New_York",
  philadelphia: "America/New_York",
  "kansas-city": "America/Chicago",
  atlanta: "America/New_York",
  houston: "America/Chicago",
  "las-vegas": "America/Los_Angeles",
  toronto: "America/Toronto",
  vancouver: "America/Vancouver",
  "mexico-city": "America/Mexico_City",
  guadalajara: "America/Mexico_City",
  monterrey: "America/Monterrey"
};

export function getCityTimeZone(cityKey?: string | null) {
  if (!cityKey) return "America/New_York";
  return CITY_TIMEZONES[cityKey] ?? "America/New_York";
}
