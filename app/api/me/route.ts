import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const profilePatchSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional().nullable(),
  firstName: z.string().trim().min(1).max(40).optional().nullable(),
  avatarEmoji: z.string().trim().min(1).max(8).optional().nullable(),
  homeCity: z.string().trim().min(1).max(80).optional().nullable(),
  favoriteCity: z.string().trim().min(1).max(80).optional(),
  favoriteCountrySlug: z.string().trim().min(1).max(80).optional().nullable(),
  language: z.string().trim().min(1).max(12).optional(),
  prefersDarkMode: z.boolean().optional(),
  defaultFilters: z
    .object({
      soundOn: z.boolean().optional(),
      reservationsPossible: z.boolean().optional(),
      outdoorSeating: z.boolean().optional()
    })
    .optional(),
  promoOptIns: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional()
    })
    .optional(),
  welcomeSeenAt: z.string().datetime().optional().nullable(),
  followedCountries: z.array(z.string().trim().min(1).max(80)).optional()
});

async function requireAuthedUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function GET() {
  const user = await requireAuthedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile, followedCountries, membership, watchedMatches] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: user.id }
    }),
    prisma.profileFollowedCountry.findMany({
      where: { profileId: user.id },
      orderBy: { followedAt: "asc" }
    }),
    prisma.profileMembership.findUnique({
      where: { profileId: user.id }
    }),
    prisma.profileWatchedMatch.findMany({
      where: { profileId: user.id },
      orderBy: { watchedAt: "asc" }
    })
  ]);

  return NextResponse.json({
    profile,
    authEmail: user.email ?? "",
    followedCountries: followedCountries.map((entry) => entry.countrySlug),
    membership,
    watchedMatches: watchedMatches.map((entry) => ({
      matchId: entry.matchId,
      watchVenueSlug: entry.watchVenueSlug
    }))
  });
}

export async function PATCH(request: Request) {
  const user = await requireAuthedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = profilePatchSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    update: {
      displayName: payload.displayName ?? undefined,
      firstName: payload.firstName ?? undefined,
      avatarEmoji: payload.avatarEmoji ?? undefined,
      homeCity: payload.homeCity ?? undefined,
      favoriteCity: payload.favoriteCity ?? undefined,
      favoriteCountrySlug: payload.favoriteCountrySlug ?? undefined,
      language: payload.language ?? undefined,
      prefersDarkMode: payload.prefersDarkMode ?? undefined,
      defaultFilters: payload.defaultFilters ?? undefined,
      promoOptIns: payload.promoOptIns ?? undefined,
      welcomeSeenAt: payload.welcomeSeenAt === undefined ? undefined : payload.welcomeSeenAt ? new Date(payload.welcomeSeenAt) : null
    },
    create: {
      id: user.id,
      displayName: payload.displayName ?? user.user_metadata?.name ?? user.email ?? "Fan",
      firstName: payload.firstName ?? null,
      avatarEmoji: payload.avatarEmoji ?? null,
      homeCity: payload.homeCity ?? null,
      favoriteCity: payload.favoriteCity ?? "nyc",
      favoriteCountrySlug: payload.favoriteCountrySlug ?? null,
      language: payload.language ?? "en",
      prefersDarkMode: payload.prefersDarkMode ?? false,
      defaultFilters: payload.defaultFilters ?? {
        soundOn: false,
        reservationsPossible: false,
        outdoorSeating: false
      },
      promoOptIns: payload.promoOptIns ?? {
        email: false,
        push: false
      },
      welcomeSeenAt: payload.welcomeSeenAt ? new Date(payload.welcomeSeenAt) : null
    }
  });

  const membership = await prisma.profileMembership.upsert({
    where: { profileId: user.id },
    update: {},
    create: {
      profileId: user.id,
      tier: "free"
    }
  });

  if (payload.followedCountries) {
    await prisma.$transaction([
      prisma.profileFollowedCountry.deleteMany({
        where: { profileId: user.id }
      }),
      ...(payload.followedCountries.length
        ? [
            prisma.profileFollowedCountry.createMany({
              data: payload.followedCountries.map((countrySlug) => ({
                profileId: user.id,
                countrySlug
              })),
              skipDuplicates: true
            })
          ]
        : [])
    ]);
  }

  const followedCountries = await prisma.profileFollowedCountry.findMany({
    where: { profileId: user.id },
    orderBy: { followedAt: "asc" }
  });

  return NextResponse.json({
    profile,
    authEmail: user.email ?? "",
    followedCountries: followedCountries.map((entry) => entry.countrySlug),
    membership
  });
}
