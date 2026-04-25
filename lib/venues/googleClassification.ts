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
  "algeria": ["algeria", "algerian", "algiers", "oran", "maghreb", "north african"],
  "argentina": ["argentina", "argentine", "argentino", "argentinian", "parrilla", "asado", "empanada", "chimichurri", "buenos aires", "porteno", "porteño", "gaucho", "malbec", "balvanera", "palermo"],
  "australia": ["australia", "australian", "aussie", "sydney", "melbourne", "flat white"],
  "austria": ["austria", "austrian", "vienna", "viennese", "wiener", "viennese cafe"],
  "belgium": ["belgium", "belgian", "belge", "belgique", "moules", "frites", "waffle", "waffles", "bxl", "bruges", "ghent", "antwerp", "liege", "trappist", "abbey ale", "saison"],
  "bosnia-and-herzegovina": ["bosnia", "bosnian", "sarajevo", "herzegovina", "balkan", "cevapi", "ćevapi", "burek"],
  "brazil": ["brazil", "brazilian", "brasileiro", "brasileira", "brasil", "churrascaria", "churrasco", "caipirinha", "boteco", "buteco", "ipanema", "copacabana", "rio", "rio de janeiro", "samba", "berimbau"],
  "canada": ["canada", "canadian", "montreal", "toronto", "quebec", "québec", "poutine"],
  "c-te-d-ivoire": ["cote d'ivoire", "côte d'ivoire", "cote divoire", "cote-divoire", "ivory coast", "ivoirian", "abidjan", "ivorian"],
  "cabo-verde": ["cabo verde", "cape verde", "cape verdean", "cape verdean", "praia", "morna", "portuguese african"],
  "colombia": ["colombia", "colombian", "colombiano", "arepa", "bandeja", "bogota", "bogotá", "medellin", "medellín"],
  "congo-dr": ["dr congo", "congo dr", "congolese", "kinshasa", "african"],
  "croatia": ["croatia", "croatian", "zagreb", "dubrovnik", "dalmatian", "balkan"],
  "cura-ao": ["curaçao", "curacao", "dutch caribbean", "caribbean", "antillean", "willemstad"],
  "czechia": ["czech", "czechia", "bohemian", "slovak", "pilsner", "pilsener", "budvar", "kozel", "koliba", "prague", "brno", "bratislava"],
  "ecuador": ["ecuador", "ecuadorian", "quito", "guayaquil", "hornado", "latin"],
  "egypt": ["egypt", "egyptian", "cairo", "alexandria", "koshary", "middle eastern"],
  "england": ["england", "english", "british", "brit", "pig n whistle", "pig & whistle", "crown", "lion", "rose", "lamb", "anchor", "red lion", "white hart", "royal oak", "george", "victoria", "winston", "churchill", "shakespeare", "chippy", "fish and chip", "ye old", "ye olde", "carragher", "beckham", "rooney", "gerrard", "baker street", "jones wood foundry", "lord's", "lords"],
  "france": ["france", "french", "français", "francais", "brasserie", "bistro", "patisserie", "boulangerie", "cafe de", "café de", "le ", "la ", "les ", "petit paris", "paris", "parisian", "lyon", "provence", "burgundy", "bordeaux", "normandy", "alsace", "frenchette"],
  "germany": ["german", "germany", "deutsch", "biergarten", "beer garden", "bierhaus", "bratwurst", "schnitzel", "sauerkraut", "oktoberfest", "zum ", "zur ", "haus", "berg", "münchen", "munich", "berlin", "frankfurt", "heidelberg", "bavaria", "bavarian", "brauhaus"],
  "ghana": ["ghana", "ghanaian", "jollof", "banku", "kelewele", "accra", "kumasi", "west african"],
  "haiti": ["haiti", "haitian", "haïtien", "griot", "tassot", "caribbean", "port-au-prince"],
  "ir-iran": ["iran", "iranian", "persian", "tehran", "shiraz", "isfahan", "persian grill"],
  "iraq": ["iraq", "iraqi", "baghdad", "mosul", "basra", "middle eastern"],
  "japan": ["japan", "japanese", "nippon", "nihon", "ramen", "sushi", "izakaya", "yakitori", "tempura", "sakura", "tokyo", "osaka", "kyoto", "samurai", "ippudo", "ichiran", "katsu", "udon", "tonkatsu"],
  "jordan": ["jordan", "jordanian", "amman", "petra", "mansaf", "levantine"],
  "korea-republic": ["korea", "korean", "hanjeongsik", "kbbq", "k-bbq", "bulgogi", "bibimbap", "soju", "makgeolli", "jongro", "koreatown", "han ", "seoul", "busan", "kimchi"],
  "mexico": ["mexico", "mexican", "mexicano", "mexicana", "taqueria", "taco", "cantina", "hacienda", "casa mex", "el ", "la ", "los ", "las ", "oaxaca", "jalisco", "puebla", "veracruz", "guanajuato", "cdmx"],
  "morocco": ["morocco", "moroccan", "maroc", "marocain", "tagine", "couscous", "tajine", "souk", "mogador", "casablanca", "marrakech", "fez", "zerza", "mourad", "kasbah", "north african"],
  "netherlands": ["netherlands", "dutch", "holland", "amsterdam", "rotterdam", "dutch caribbean", "stroopwafel"],
  "new-zealand": ["new zealand", "new zealand cafe", "kiwi", "auckland", "wellington"],
  "norway": ["norway", "norwegian", "oslo", "bergen", "aquavit", "scandinavian", "nordic"],
  "panama": ["panama", "panamanian", "panameño", "panameno", "panama city", "latin american"],
  "paraguay": ["paraguay", "paraguayan", "asuncion", "asunción", "south american"],
  "portugal": ["portugal", "portuguese", "português", "portugues", "pastel de nata", "pasteis", "pastéis", "bacalhau", "tasca", "taberna", "fado", "lisbon", "porto", "lavrador", "joey bats", "nata"],
  "qatar": ["qatar", "qatari", "doha"],
  "saudi-arabia": ["saudi arabia", "saudi", "saudi arabian", "riyadh", "jeddah", "arabic", "middle eastern"],
  "scotland": ["scotland", "scottish", "scotch", "highlands", "highland", "thistle", "edinburgh", "glasgow", "tartan", "clan", "burns", "wallace", "braveheart", "caledonian"],
  "senegal": ["senegal", "senegalese", "sénégalais", "senegalais", "thiebou", "teranga", "dakar", "west african"],
  "south-africa": ["south africa", "south african", "cape town", "johannesburg", "durban", "braai"],
  "spain": ["spain", "spanish", "español", "española", "espanol", "tapas", "paella", "sangria", "tortilla española", "bodega", "taberna", "boqueria", "mercado", "barcelona", "madrid", "sevilla", "valencia", "iberian"],
  "sweden": ["sweden", "swedish", "stockholm", "gothenburg", "scandinavian", "fika"],
  "switzerland": ["switzerland", "swiss", "zurich", "zürich", "geneva", "fondue", "raclette"],
  "tunisia": ["tunisia", "tunisian", "tunis", "sfax", "brik", "north african"],
  "t-rkiye": ["turkish", "turkey", "turkiye", "türkiye", "kebab", "istanbul", "ankara", "meyhane", "baklava"],
  "uruguay": ["uruguay", "uruguayan", "montevideo", "chivito", "south american"],
  "usa": ["american sports bar", "american", "usmnt", "usa soccer", "american outlaws", "grill"],
  "uzbekistan": ["uzbek", "uzbekistan", "central asian", "uzbek plov", "tashkent", "plov", "samsa"]
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

const SPORTS_BAR_NAME_PATTERNS = [
  "sports",
  "sport",
  "soccer",
  "football",
  "football factory",
  "world cup",
  "watch party",
  "fan fest",
  "fan zone",
  "standings",
  "legends",
  "smithfield",
  "banter",
  "soccer republic",
  "nevada smith",
  "mchale",
  "kent ale house"
];

const GENERAL_BAR_NAME_PATTERNS = [
  "bar",
  "pub",
  "tavern",
  "lounge",
  "ale house",
  "taproom",
  "beer hall",
  "beer garden",
  "brewery",
  "cocktail"
];

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

function hasRestaurantSignal(types: string[]) {
  return types.some((type) => PURE_RESTAURANT_EXCLUSION_TYPES.has(type) || type.includes("restaurant"));
}

function isPureRestaurant(types: string[]) {
  return !hasBarSignal(types) && types.every((type) => PURE_RESTAURANT_EXCLUSION_TYPES.has(type));
}

function hasSoccerKeyword(name: string) {
  return /(sports|bar|pub|tavern|lounge|grill|soccer|football|watch party|fan fest)/i.test(name);
}

function hasSportsBarNameSignal(name: string) {
  return SPORTS_BAR_NAME_PATTERNS.some((pattern) => name.includes(pattern));
}

function hasGeneralBarNameSignal(name: string) {
  return GENERAL_BAR_NAME_PATTERNS.some((pattern) => name.includes(pattern));
}

function isFanFest(name: string, types: string[]) {
  return /(fan fest|watch party|supporters club|supporter club|official fan zone|fan zone)/i.test(name) || types.includes("event_venue");
}

export function inferCountryFromPlace(place: GoogleLikePlace, searchCountry?: string | null): CountryMatchReason {
  const name = normalizeText(place.displayName?.text ?? "");
  const types = (place.types ?? []).map((type) => type.toLowerCase());

  if (!searchCountry) {
    return { kind: "none" };
  }

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

function classifyWithoutCountryIdentity(place: GoogleLikePlace): Pick<VenueClassification, "venueIntent" | "showsSoccer"> {
  const types = (place.types ?? []).map((type) => type.toLowerCase());
  const barLike = hasBarSignal(types);
  const restaurantLike = hasRestaurantSignal(types);
  const name = normalizeText(place.displayName?.text ?? "");
  const sportsSpecific = hasSportsBarNameSignal(name);
  const generalBar = hasGeneralBarNameSignal(name);
  const venueIntent: VenueIntentKey = isFanFest(name, types)
    ? "fan_fest"
    : sportsSpecific
      ? "sports_bar"
      : barLike
        ? "bar_with_tv"
      : restaurantLike
        ? "cultural_restaurant"
        : generalBar
          ? "bar_with_tv"
          : "cultural_restaurant";
  const showsSoccer =
    venueIntent === "sports_bar" ||
    venueIntent === "bar_with_tv" ||
    venueIntent === "fan_fest" ||
    (hasSoccerKeyword(name) && !isPureRestaurant(types));

  return { venueIntent, showsSoccer };
}

export function classifyPlaceForCountry(place: GoogleLikePlace, searchCountry?: string | null): VenueClassification {
  const types = (place.types ?? []).map((type) => type.toLowerCase());
  const name = place.displayName?.text ?? "";
  const resolvedCountry = searchCountry ?? null;
  const reason = inferCountryFromPlace(place, searchCountry);
  const hasCountryIdentity = reason.kind !== "none";
  const barLike = hasBarSignal(types);
  const uncategorized = classifyWithoutCountryIdentity(place);
  const venueIntent = isFanFest(name, types)
    ? "fan_fest"
    : hasCountryIdentity
      ? barLike
        ? "cultural_bar"
        : "cultural_restaurant"
      : uncategorized.venueIntent;
  const showsSoccer = hasCountryIdentity
    ? venueIntent === "cultural_bar" || uncategorized.showsSoccer
    : uncategorized.showsSoccer;

  return {
    likelySupporterCountry: hasCountryIdentity ? resolvedCountry : null,
    associatedCountries: hasCountryIdentity && resolvedCountry ? [resolvedCountry] : [],
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

export function classifyCachedVenueForCountry(venue: Venue, searchCountry?: string | null): VenueClassification {
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

  if (venueIntent === "bar_with_tv") {
    return `${name} is a general bar with TVs in ${city?.label ?? cityKey}, with no verified country affiliation.`;
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
