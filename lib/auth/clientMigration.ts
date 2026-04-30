"use client";

type PersistedProfile = {
  displayName?: string;
  firstName?: string;
  avatarEmoji?: string;
  homeCity?: string;
  favoriteCity?: string;
  favoriteCountrySlug?: string;
  language?: string;
  prefersDarkMode?: boolean;
  defaultFilters?: {
    soundOn?: boolean;
    reservationsPossible?: boolean;
    outdoorSeating?: boolean;
  };
  promoOptIns?: {
    email?: boolean;
    push?: boolean;
    proximityPromos?: boolean;
    groupPromos?: boolean;
    savedVenuePromoAlerts?: boolean;
    wantsGroups?: boolean;
    notificationPermission?: "default" | "granted" | "denied" | "unsupported";
  };
  welcomeSeenAt?: number;
  followingCountrySlugs?: string[];
  watchlistMatchIds?: string[];
  watchVenues?: Record<string, string | null>;
};

function readPersistedMigrationSnapshot() {
  try {
    const persistedUserRaw = window.localStorage.getItem("gameday-user");
    const persistedFavoritesRaw = window.localStorage.getItem("gameday-favorites");

    const persistedUser = persistedUserRaw ? JSON.parse(persistedUserRaw) : null;
    const persistedFavorites = persistedFavoritesRaw ? JSON.parse(persistedFavoritesRaw) : null;
    const profile = (persistedUser?.state?.profile ?? null) as PersistedProfile | null;
    const favorites = Array.isArray(persistedFavorites?.state?.favorites) ? persistedFavorites.state.favorites : [];

    return { profile, favorites };
  } catch {
    return {
      profile: null,
      favorites: []
    };
  }
}

async function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function migrateWithRetry(payload: Record<string, unknown>, retries = 6, retryDelayMs = 500) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const response = await fetch("/api/me/migrate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return response.json();
    }

    if (response.status !== 401 || attempt === retries - 1) {
      throw new Error(`Migration failed with status ${response.status}`);
    }

    await wait(retryDelayMs);
  }

  throw new Error("Migration failed");
}

export async function migrateAnonymousStateIfPresent() {
  const { profile, favorites } = readPersistedMigrationSnapshot();

  if (!profile) return null;

  const watchedMatches = (profile.watchlistMatchIds ?? []).map((matchId) => ({
    matchId,
    watchVenueSlug: profile.watchVenues?.[matchId] ?? null
  }));

  const hasLocalState =
    favorites.length > 0 ||
    watchedMatches.length > 0 ||
    (profile.followingCountrySlugs?.length ?? 0) > 0 ||
    Boolean(profile.firstName) ||
    Boolean(profile.favoriteCountrySlug);

  if (!hasLocalState) {
    return null;
  }

  return migrateWithRetry({
    profile: {
      displayName: profile.displayName,
      firstName: profile.firstName,
      avatarEmoji: profile.avatarEmoji,
      homeCity: profile.homeCity,
      favoriteCity: profile.favoriteCity,
      favoriteCountrySlug: profile.favoriteCountrySlug,
      language: profile.language,
      prefersDarkMode: profile.prefersDarkMode,
      defaultFilters: profile.defaultFilters,
      promoOptIns: profile.promoOptIns,
      welcomeSeenAt: profile.welcomeSeenAt ? new Date(profile.welcomeSeenAt).toISOString() : null
    },
    followedCountries: profile.followingCountrySlugs ?? [],
    favoriteVenues: favorites,
    watchedMatches
  });
}
