import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const migrateSchema = z.object({
  profile: z.record(z.any()).default({}),
  followedCountries: z.array(z.string()).default([]),
  favoriteVenues: z.array(z.string()).default([]),
  watchedMatches: z
    .array(
      z.object({
        matchId: z.string(),
        watchVenueSlug: z.string().nullable().optional()
      })
    )
    .default([])
});

type ProfileRow = {
  id: string;
  displayName: string | null;
  firstName: string | null;
  avatarEmoji: string | null;
  homeCity: string | null;
  favoriteCity: string;
  favoriteCountrySlug: string | null;
  language: string;
  prefersDarkMode: boolean;
  defaultFilters: {
    soundOn?: boolean;
    reservationsPossible?: boolean;
    outdoorSeating?: boolean;
  };
  promoOptIns: {
    email?: boolean;
    push?: boolean;
    proximityPromos?: boolean;
    groupPromos?: boolean;
    savedVenuePromoAlerts?: boolean;
    wantsGroups?: boolean;
    notificationPermission?: "default" | "granted" | "denied" | "unsupported";
  };
  welcomeSeenAt: string | null;
  createdAt?: string;
};

type FollowedCountryRow = {
  profileId: string;
  countrySlug: string;
};

type FavoriteVenueRow = {
  profileId: string;
  venueSlug: string;
};

type WatchedMatchRow = {
  profileId: string;
  matchId: string;
  watchVenueSlug: string | null;
};

type MembershipRow = {
  profileId: string;
  tier: string;
  upgradedAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

const DEFAULT_PROMO_OPT_INS = {
  email: false,
  push: false,
  proximityPromos: false,
  groupPromos: false,
  savedVenuePromoAlerts: false,
  wantsGroups: false,
  notificationPermission: "default"
} as const;

async function requireAuthedUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

async function restSelect<T>(table: string, query: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to read ${table}: ${response.status}`);
  }

  return (await response.json()) as T[];
}

async function restInsert(table: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(rows),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to insert ${table}: ${response.status}`);
  }
}

async function restPatch(table: string, query: string, row: Record<string, unknown>) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(row),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to patch ${table}: ${response.status}`);
  }
}

async function upsertRows(table: string, rows: Array<Record<string, unknown>>, onConflict: string) {
  if (!rows.length) return;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`,
    {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify(rows),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to upsert ${table}: ${response.status}`);
  }
}

export async function POST(request: Request) {
  const user = await requireAuthedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = migrateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const [existingProfile] = await restSelect<ProfileRow>("Profile", `id=eq.${encodeURIComponent(user.id)}&select=*`);

  const mergedProfileRow: ProfileRow = {
    id: user.id,
    displayName: existingProfile?.displayName ?? payload.profile.displayName ?? user.user_metadata?.name ?? user.email ?? "Fan",
    firstName: existingProfile?.firstName ?? payload.profile.firstName ?? null,
    avatarEmoji: existingProfile?.avatarEmoji ?? payload.profile.avatarEmoji ?? null,
    homeCity: existingProfile?.homeCity ?? payload.profile.homeCity ?? null,
    favoriteCity: existingProfile?.favoriteCity ?? payload.profile.favoriteCity ?? "nyc",
    favoriteCountrySlug: existingProfile?.favoriteCountrySlug ?? payload.profile.favoriteCountrySlug ?? null,
    language: existingProfile?.language ?? payload.profile.language ?? "en",
    prefersDarkMode: existingProfile?.prefersDarkMode ?? payload.profile.prefersDarkMode ?? false,
    defaultFilters: existingProfile?.defaultFilters ?? payload.profile.defaultFilters ?? {
      soundOn: false,
      reservationsPossible: false,
      outdoorSeating: false
    },
    promoOptIns: {
      ...DEFAULT_PROMO_OPT_INS,
      ...(existingProfile?.promoOptIns ?? {}),
      ...(payload.profile.promoOptIns ?? {})
    },
    welcomeSeenAt: existingProfile?.welcomeSeenAt ?? (payload.profile.welcomeSeenAt ?? null)
  };

  if (existingProfile) {
    await restPatch("Profile", `id=eq.${encodeURIComponent(user.id)}`, {
      displayName: mergedProfileRow.displayName,
      firstName: mergedProfileRow.firstName,
      avatarEmoji: mergedProfileRow.avatarEmoji,
      homeCity: mergedProfileRow.homeCity,
      favoriteCity: mergedProfileRow.favoriteCity,
      favoriteCountrySlug: mergedProfileRow.favoriteCountrySlug,
      language: mergedProfileRow.language,
      prefersDarkMode: mergedProfileRow.prefersDarkMode,
      defaultFilters: mergedProfileRow.defaultFilters,
      promoOptIns: mergedProfileRow.promoOptIns,
      welcomeSeenAt: mergedProfileRow.welcomeSeenAt
    });
  } else {
    await restInsert("Profile", [
      {
        ...mergedProfileRow,
        welcomeSeenAt: mergedProfileRow.welcomeSeenAt
      }
    ]);
  }

  const [existingMembership] = await restSelect<MembershipRow>(
    "ProfileMembership",
    `profileId=eq.${encodeURIComponent(user.id)}&select=*`
  );

  if (!existingMembership) {
    await restInsert("ProfileMembership", [
      {
        profileId: user.id,
        tier: "free",
        cancelAtPeriodEnd: false
      }
    ]);
  }

  await upsertRows(
    "ProfileFollowedCountry",
    payload.followedCountries.map((countrySlug) => ({
      profileId: user.id,
      countrySlug
    })),
    "profileId,countrySlug"
  );

  await upsertRows(
    "ProfileFavoriteVenue",
    payload.favoriteVenues.map((venueSlug) => ({
      profileId: user.id,
      venueSlug
    })),
    "profileId,venueSlug"
  );

  await upsertRows(
    "ProfileWatchedMatch",
    payload.watchedMatches.map((watchedMatch) => ({
      profileId: user.id,
      matchId: watchedMatch.matchId,
      watchVenueSlug: watchedMatch.watchVenueSlug ?? null
    })),
    "profileId,matchId"
  );

  const [profiles, followedCountries, favoriteVenues, watchedMatches, memberships] = await Promise.all([
    restSelect<ProfileRow>("Profile", `id=eq.${encodeURIComponent(user.id)}&select=*`),
    restSelect<FollowedCountryRow>(
      "ProfileFollowedCountry",
      `profileId=eq.${encodeURIComponent(user.id)}&select=*&order=followedAt.asc`
    ),
    restSelect<FavoriteVenueRow>(
      "ProfileFavoriteVenue",
      `profileId=eq.${encodeURIComponent(user.id)}&select=*&order=savedAt.asc`
    ),
    restSelect<WatchedMatchRow>(
      "ProfileWatchedMatch",
      `profileId=eq.${encodeURIComponent(user.id)}&select=*&order=watchedAt.asc`
    ),
    restSelect<MembershipRow>("ProfileMembership", `profileId=eq.${encodeURIComponent(user.id)}&select=*`)
  ]);

  return NextResponse.json({
    profile: profiles[0] ?? mergedProfileRow,
    authEmail: user.email ?? "",
    followedCountries: followedCountries.map((entry) => entry.countrySlug),
    favoriteVenues: favoriteVenues.map((entry) => entry.venueSlug),
    watchedMatches: watchedMatches.map((entry) => ({
      matchId: entry.matchId,
      watchVenueSlug: entry.watchVenueSlug
    })),
    membership: memberships[0] ?? {
      profileId: user.id,
      tier: "free",
      upgradedAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false
    }
  });
}
