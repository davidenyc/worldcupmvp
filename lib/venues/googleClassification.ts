import { demoCountries } from "@/lib/data/demo";
import { getHostCity } from "@/lib/data/hostCities";
import { Venue, VenueIntentKey, VenueTypeKey } from "@/lib/types";

type GoogleLikePlace = {
  displayName?: { text?: string };
  types?: string[];
};

type CountryMatchReason =
  | { kind: "name"; value: string }
  | { kind: "type"; value: string }
  | { kind: "none" };

export type VenueClassification = {
  likelySupporterCountry: string | null;
  associatedCountries: string[];
  venueIntent: VenueIntentKey;
  showsSoccer: boolean;
  reason: CountryMatchReason;
};

const countryNameBySlug = new Map(demoCountries.map((country) => [country.slug, country.name] as const));

const COUNTRY_VARIANTS: Record<string, string[]> = {
  "algeria": ["algeria", "algerian", "algiers", "oran", "maghreb"],
  "argentina": ["argentina", "argentine", "argentino", "buenos aires", "parrilla", "asado", "empanada", "porteno", "porteño"],
  "australia": ["australia", "australian", "aussie", "sydney", "melbourne"],
  "austria": ["austria", "austrian", "vienna", "viennese", "wiener"],
  "belgium": ["belgium", "belgian", "brussels", "belgique", "belgisch", "moules", "frites"],
  "bosnia-and-herzegovina": ["bosnia", "bosnian", "sarajevo", "herzegovina", "cevapi", "ćevapi", "burek"],
  "brazil": ["brazil", "brazilian", "brasileiro", "brasil", "rio", "sao paulo", "são paulo", "churrascaria", "boteco", "buteco", "caipirinha"],
  "canada": ["canada", "canadian", "montreal", "toronto", "quebec", "québec", "poutine"],
  "c-te-d-ivoire": ["cote d'ivoire", "côte d'ivoire", "ivory coast", "ivoirian", "abidjan"],
  "cabo-verde": ["cabo verde", "cape verde", "cape verdean", "praia", "morna"],
  "colombia": ["colombia", "colombian", "colombiano", "bogota", "bogotá", "medellin", "medellín", "arepa", "bandeja"],
  "congo-dr": ["dr congo", "congo dr", "congolese", "kinshasa"],
  "croatia": ["croatia", "croatian", "zagreb", "dubrovnik", "dalmatian"],
  "cura-ao": ["curaçao", "curacao", "willemstad", "antillean"],
  "czechia": ["czechia", "czech", "prague", "bohemian", "pilsner"],
  "ecuador": ["ecuador", "ecuadorian", "quito", "guayaquil", "hornado"],
  "egypt": ["egypt", "egyptian", "cairo", "alexandria", "koshary"],
  "england": ["england", "english", "british", "london", "manchester", "ye olde", "churchill", "shakespeare", "baker street", "fish and chips", "carragher"],
  "france": ["france", "french", "francais", "français", "paris", "parisian", "brasserie", "bistro", "frenchette"],
  "germany": ["germany", "german", "deutsch", "berlin", "munich", "münchen", "biergarten", "bierhaus", "brauhaus", "bratwurst", "schnitzel", "zum ", "zur "],
  "ghana": ["ghana", "ghanaian", "accra", "kumasi", "jollof", "banku", "kelewele"],
  "haiti": ["haiti", "haitian", "haitian", "griot", "tassot", "port-au-prince"],
  "ir-iran": ["iran", "iranian", "persian", "tehran", "shiraz", "isfahan"],
  "iraq": ["iraq", "iraqi", "baghdad", "mosul", "basra"],
  "japan": ["japan", "japanese", "tokyo", "osaka", "ramen", "sushi", "izakaya", "yakitori", "sakura"],
  "jordan": ["jordan", "jordanian", "amman", "petra", "mansaf"],
  "korea-republic": ["korea", "korean", "seoul", "busan", "kbbq", "k-bbq", "bulgogi", "bibimbap", "soju", "kimchi"],
  "mexico": ["mexico", "mexican", "mexicano", "mexico city", "cdmx", "oaxaca", "guadalajara", "taqueria", "taquería", "cantina"],
  "morocco": ["morocco", "moroccan", "marocain", "casablanca", "marrakesh", "tagine", "couscous", "riad"],
  "netherlands": ["netherlands", "dutch", "holland", "amsterdam", "rotterdam", "stroopwafel"],
  "new-zealand": ["new zealand", "new zealander", "kiwi", "auckland", "wellington"],
  "norway": ["norway", "norwegian", "oslo", "bergen", "aquavit"],
  "panama": ["panama", "panamanian", "panameno", "panameño"],
  "paraguay": ["paraguay", "paraguayan", "asuncion", "asunción"],
  "portugal": ["portugal", "portuguese", "portugues", "português", "lisbon", "porto", "nata", "pasteis", "pastéis", "bacalhau", "fado"],
  "qatar": ["qatar", "qatari", "doha"],
  "saudi-arabia": ["saudi arabia", "saudi", "saudi arabian", "riyadh", "jeddah"],
  "scotland": ["scotland", "scottish", "glasgow", "edinburgh", "caledonia", "tartan", "whisky"],
  "senegal": ["senegal", "senegalese", "senegalais", "sénégalais", "dakar", "teranga", "thiebou"],
  "south-africa": ["south africa", "south african", "cape town", "johannesburg", "durban", "braai"],
  "spain": ["spain", "spanish", "espanol", "español", "madrid", "barcelona", "tapas", "paella", "taberna", "bodega"],
  "sweden": ["sweden", "swedish", "stockholm", "gothenburg", "fika"],
  "switzerland": ["switzerland", "swiss", "zurich", "zürich", "geneva", "fondue", "raclette"],
  "tunisia": ["tunisia", "tunisian", "tunis", "sfax", "brik"],
  "t-rkiye": ["turkiye", "türkiye", "turkey", "turkish", "istanbul", "ankara", "meyhane", "baklava"],
  "uruguay": ["uruguay", "uruguayan", "montevideo", "chivito"],
  "usa": ["usmnt", "usa soccer", "american outlaws", "yankee stadium"],
  "uzbekistan": ["uzbek", "uzbekistan", "tashkent", "plov", "samsa"]
};

const COUNTRY_CUISINE_TYPES: Record<string, string[]> = {
  argentina: ["argentinian_restaurant", "argentine_restaurant"],
  australia: ["australian_restaurant"],
  austria: ["austrian_restaurant"],
  belgium: ["belgian_restaurant"],
  brazil: ["brazilian_restaurant"],
  "c-te-d-ivoire": ["ivorian_restaurant"],
  colombia: ["colombian_restaurant"],
  czechia: ["czech_restaurant"],
  ecuador: ["ecuadorian_restaurant"],
  england: ["british_restaurant"],
  france: ["french_restaurant"],
  germany: ["german_restaurant"],
  ghana: ["ghanaian_restaurant"],
  haiti: ["haitian_restaurant"],
  "ir-iran": ["persian_restaurant", "iranian_restaurant"],
  iraq: ["iraqi_restaurant"],
  japan: ["japanese_restaurant", "ramen_restaurant", "sushi_restaurant", "izakaya_restaurant"],
  "korea-republic": ["korean_restaurant", "korean_barbecue_restaurant"],
  mexico: ["mexican_restaurant"],
  morocco: ["moroccan_restaurant"],
  panama: ["panamanian_restaurant"],
  portugal: ["portuguese_restaurant"],
  senegal: ["senegalese_restaurant"],
  spain: ["spanish_restaurant", "tapas_restaurant"],
  sweden: ["swedish_restaurant"],
  switzerland: ["swiss_restaurant"],
  "t-rkiye": ["turkish_restaurant"],
  uzbekistan: ["uzbeki_restaurant"]
};

const BAR_TYPES = new Set([
  "bar",
  "pub",
  "sports_bar",
  "night_club",
  "cocktail_bar",
  "wine_bar",
  "beer_hall",
  "beer_garden",
  "brewpub",
  "lounge",
  "irish_pub",
  "british_pub",
  "tapas_bar"
]);

const PURE_RESTAURANT_EXCLUSION_TYPES = new Set([
  "restaurant",
  "cafe",
  "bakery",
  "coffee_shop",
  "cultural_center",
  "community_center"
]);

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.filter(Boolean).map((value) => normalizeText(value.trim()))));
}

export function getCountryNameVariants(searchCountry: string) {
  const country = demoCountries.find((item) => item.slug === searchCountry);
  const base = country
    ? [country.name, country.slug.replace(/-/g, " ")]
    : [searchCountry.replace(/-/g, " ")];
  return dedupe([...(COUNTRY_VARIANTS[searchCountry] ?? []), ...base]);
}

export function getCuisineTypesForCountry(searchCountry: string) {
  return (COUNTRY_CUISINE_TYPES[searchCountry] ?? []).map((value) => value.toLowerCase());
}

function findNameVariantMatch(name: string, variants: string[]) {
  for (const variant of variants) {
    if (!variant) continue;
    if (variant.endsWith(" ")) {
      if (name.startsWith(variant)) return variant.trim();
      continue;
    }

    if (variant.includes(" ")) {
      if (name.includes(variant)) return variant;
      continue;
    }

    const regex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(name)) return variant;
  }

  return null;
}

function hasBarSignal(types: string[]) {
  return types.some((type) => BAR_TYPES.has(type));
}

function isPureRestaurant(types: string[]) {
  return !hasBarSignal(types) && types.every((type) => PURE_RESTAURANT_EXCLUSION_TYPES.has(type));
}

function hasSoccerKeyword(name: string) {
  return /(sports|bar|pub|tavern|lounge|grill|soccer|football|watch party|fan fest)/i.test(name);
}

function isFanFest(name: string, types: string[]) {
  return /(fan fest|watch party|supporters club|supporter club|official fan zone|fan zone)/i.test(name) || types.includes("event_venue");
}

export function inferCountryFromPlace(place: GoogleLikePlace, searchCountry: string): CountryMatchReason {
  const name = normalizeText(place.displayName?.text ?? "");
  const types = (place.types ?? []).map((type) => type.toLowerCase());

  const variantMatch = findNameVariantMatch(name, getCountryNameVariants(searchCountry));
  if (variantMatch) {
    return { kind: "name", value: variantMatch };
  }

  const cuisineMatch = getCuisineTypesForCountry(searchCountry).find((type) => types.includes(type));
  if (cuisineMatch) {
    return { kind: "type", value: cuisineMatch };
  }

  return { kind: "none" };
}

export function classifyPlaceForCountry(place: GoogleLikePlace, searchCountry: string): VenueClassification {
  const types = (place.types ?? []).map((type) => type.toLowerCase());
  const name = place.displayName?.text ?? "";
  const reason = inferCountryFromPlace(place, searchCountry);
  const hasCountryIdentity = reason.kind !== "none";
  const barLike = hasBarSignal(types);
  const venueIntent = isFanFest(name, types)
    ? "fan_fest"
    : hasCountryIdentity
      ? barLike
        ? "cultural_bar"
        : "cultural_restaurant"
      : barLike
        ? "sports_bar"
        : "cultural_restaurant";
  const showsSoccer =
    venueIntent === "sports_bar" ||
    venueIntent === "fan_fest" ||
    (hasSoccerKeyword(name) && !isPureRestaurant(types));

  return {
    likelySupporterCountry: hasCountryIdentity ? searchCountry : null,
    associatedCountries: hasCountryIdentity ? [searchCountry] : [],
    venueIntent,
    showsSoccer,
    reason
  };
}

function googleishTypesFromVenue(venue: Venue) {
  const types = new Set<string>();
  for (const venueType of venue.venueTypes) {
    switch (venueType as VenueTypeKey) {
      case "bar":
        types.add("bar");
        break;
      case "restaurant":
        types.add("restaurant");
        break;
      case "cafe":
        types.add("cafe");
        break;
      case "bakery":
        types.add("bakery");
        break;
      case "lounge":
        types.add("lounge");
        break;
      case "cultural_center":
        types.add("cultural_center");
        break;
      case "supporter_club":
        types.add("sports_bar");
        break;
      default:
        break;
    }
  }
  return Array.from(types);
}

export function classifyCachedVenueForCountry(venue: Venue, searchCountry: string): VenueClassification {
  return classifyPlaceForCountry(
    {
      displayName: { text: venue.name },
      types: googleishTypesFromVenue(venue)
    },
    searchCountry
  );
}

export function formatCountryAuditLine(venue: Venue, searchCountry: string) {
  const classification = classifyCachedVenueForCountry(venue, searchCountry);
  const countryName = classification.likelySupporterCountry
    ? countryNameBySlug.get(classification.likelySupporterCountry) ?? classification.likelySupporterCountry
    : null;
  const symbol = classification.reason.kind === "none" ? "⚠" : "✓";
  const reasonText =
    classification.reason.kind === "name"
      ? `name match: "${classification.reason.value}"`
      : classification.reason.kind === "type"
        ? `type match: ${classification.reason.value}`
        : "no country match found";
  const label = classification.likelySupporterCountry
    ? `${classification.venueIntent} ${countryName ? demoCountries.find((country) => country.slug === searchCountry)?.flagEmoji ?? "" : ""}`.trim()
    : `${classification.venueIntent}, NO FLAG`;

  return {
    classification,
    line: `  ${symbol} ${venue.name} — ${label} (${reasonText})`
  };
}

export function buildImportedVenueDescription(name: string, cityKey: string, countrySlug: string | null, venueIntent: VenueIntentKey) {
  const city = getHostCity(cityKey);
  const countryName = countrySlug ? countryNameBySlug.get(countrySlug) ?? countrySlug : null;

  if (venueIntent === "sports_bar") {
    return `${name} is a general sports bar in ${city?.label ?? cityKey}, with no verified country affiliation.`;
  }

  if (venueIntent === "fan_fest") {
    return `${name} is a watch-party style venue in ${city?.label ?? cityKey}.`;
  }

  if (countryName && venueIntent === "cultural_bar") {
    return `${name} is a ${countryName} bar in ${city?.label ?? cityKey}.`;
  }

  if (countryName) {
    return `${name} is a ${countryName} restaurant in ${city?.label ?? cityKey}.`;
  }

  return `${name} is a venue in ${city?.label ?? cityKey}.`;
}
