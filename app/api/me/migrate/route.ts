import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
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

async function requireAuthedUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
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
  const existingProfile = await prisma.profile.findUnique({
    where: { id: user.id }
  });

  const mergedProfile = await prisma.profile.upsert({
    where: { id: user.id },
    update: {
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
      promoOptIns: existingProfile?.promoOptIns ?? payload.profile.promoOptIns ?? {
        email: false,
        push: false
      },
      welcomeSeenAt: existingProfile?.welcomeSeenAt ?? (payload.profile.welcomeSeenAt ? new Date(payload.profile.welcomeSeenAt) : null)
    },
    create: {
      id: user.id,
      displayName: payload.profile.displayName ?? user.user_metadata?.name ?? user.email ?? "Fan",
      firstName: payload.profile.firstName ?? null,
      avatarEmoji: payload.profile.avatarEmoji ?? null,
      homeCity: payload.profile.homeCity ?? null,
      favoriteCity: payload.profile.favoriteCity ?? "nyc",
      favoriteCountrySlug: payload.profile.favoriteCountrySlug ?? null,
      language: payload.profile.language ?? "en",
      prefersDarkMode: payload.profile.prefersDarkMode ?? false,
      defaultFilters: payload.profile.defaultFilters ?? {
        soundOn: false,
        reservationsPossible: false,
        outdoorSeating: false
      },
      promoOptIns: payload.profile.promoOptIns ?? {
        email: false,
        push: false
      },
      welcomeSeenAt: payload.profile.welcomeSeenAt ? new Date(payload.profile.welcomeSeenAt) : null
    }
  });

  if (payload.followedCountries.length) {
    await prisma.profileFollowedCountry.createMany({
      data: payload.followedCountries.map((countrySlug) => ({
        profileId: user.id,
        countrySlug
      })),
      skipDuplicates: true
    });
  }

  if (payload.favoriteVenues.length) {
    await prisma.profileFavoriteVenue.createMany({
      data: payload.favoriteVenues.map((venueSlug) => ({
        profileId: user.id,
        venueSlug
      })),
      skipDuplicates: true
    });
  }

  if (payload.watchedMatches.length) {
    for (const watchedMatch of payload.watchedMatches) {
      await prisma.profileWatchedMatch.upsert({
        where: {
          profileId_matchId: {
            profileId: user.id,
            matchId: watchedMatch.matchId
          }
        },
        update: {},
        create: {
          profileId: user.id,
          matchId: watchedMatch.matchId,
          watchVenueSlug: watchedMatch.watchVenueSlug ?? null
        }
      });
    }
  }

  const [followedCountries, favoriteVenues, watchedMatches, membership] = await Promise.all([
    prisma.profileFollowedCountry.findMany({
      where: { profileId: user.id },
      orderBy: { followedAt: "asc" }
    }),
    prisma.profileFavoriteVenue.findMany({
      where: { profileId: user.id },
      orderBy: { savedAt: "asc" }
    }),
    prisma.profileWatchedMatch.findMany({
      where: { profileId: user.id },
      orderBy: { watchedAt: "asc" }
    }),
    prisma.profileMembership.upsert({
      where: { profileId: user.id },
      update: {},
      create: {
        profileId: user.id,
        tier: "free"
      }
    })
  ]);

  return NextResponse.json({
    profile: mergedProfile,
    authEmail: user.email ?? "",
    followedCountries: followedCountries.map((entry) => entry.countrySlug),
    favoriteVenues: favoriteVenues.map((entry) => entry.venueSlug),
    watchedMatches: watchedMatches.map((entry) => ({
      matchId: entry.matchId,
      watchVenueSlug: entry.watchVenueSlug
    })),
    membership
  });
}
