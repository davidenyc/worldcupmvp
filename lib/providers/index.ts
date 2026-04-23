import { withCache } from "@/lib/cache/memory";
import { ManualVenueProvider } from "@/lib/providers/manual";
import { MockVenueProvider } from "@/lib/providers/mock";
import { VenueProvider } from "@/lib/providers/types";
import { YelpProvider } from "@/lib/providers/yelp";
import { GooglePlacesProvider } from "@/lib/providers/googlePlaces";

const providers: Record<string, VenueProvider> = {
  mock: new MockVenueProvider(),
  manual: new ManualVenueProvider(),
  yelp: new YelpProvider(),
  google: new GooglePlacesProvider()
};

export function getActiveVenueProvider() {
  const provider = process.env.DATA_PROVIDER ?? "mock";
  return providers[provider] ?? providers.mock;
}

export async function getCachedProviderResult<T>(
  key: string,
  factory: () => Promise<T> | T
) {
  return withCache(`provider:${key}`, 60_000, factory);
}
