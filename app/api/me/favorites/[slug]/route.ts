import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const FREE_SAVE_LIMIT = 5;

async function requireAuthedUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function POST(_request: Request, { params }: { params: { slug: string } }) {
  const user = await requireAuthedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = params.slug;
  const membership = await prisma.profileMembership.upsert({
    where: { profileId: user.id },
    update: {},
    create: { profileId: user.id, tier: "free" }
  });

  if (membership.tier === "free") {
    const count = await prisma.profileFavoriteVenue.count({
      where: { profileId: user.id }
    });

    if (count >= FREE_SAVE_LIMIT) {
      return NextResponse.json({ error: "Free tier save limit reached" }, { status: 403 });
    }
  }

  await prisma.profile.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      displayName: user.user_metadata?.name ?? user.email ?? "Fan"
    }
  });

  const favorite = await prisma.profileFavoriteVenue.upsert({
    where: {
      profileId_venueSlug: {
        profileId: user.id,
        venueSlug: slug
      }
    },
    update: {},
    create: {
      profileId: user.id,
      venueSlug: slug
    }
  });

  return NextResponse.json({ favorite });
}

export async function DELETE(_request: Request, { params }: { params: { slug: string } }) {
  const user = await requireAuthedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.profileFavoriteVenue.deleteMany({
    where: {
      profileId: user.id,
      venueSlug: params.slug
    }
  });

  return NextResponse.json({ ok: true });
}
