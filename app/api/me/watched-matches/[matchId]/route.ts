import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const watchedMatchSchema = z.object({
  watchVenueSlug: z.string().trim().min(1).max(160).optional().nullable()
});

async function requireAuthedUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function POST(request: Request, { params }: { params: { matchId: string } }) {
  const user = await requireAuthedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = watchedMatchSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.profile.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      displayName: user.user_metadata?.name ?? user.email ?? "Fan"
    }
  });

  const watchedMatch = await prisma.profileWatchedMatch.upsert({
    where: {
      profileId_matchId: {
        profileId: user.id,
        matchId: params.matchId
      }
    },
    update: {
      watchVenueSlug: parsed.data.watchVenueSlug ?? null
    },
    create: {
      profileId: user.id,
      matchId: params.matchId,
      watchVenueSlug: parsed.data.watchVenueSlug ?? null
    }
  });

  return NextResponse.json({ watchedMatch });
}

export async function DELETE(_request: Request, { params }: { params: { matchId: string } }) {
  const user = await requireAuthedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.profileWatchedMatch.deleteMany({
    where: {
      profileId: user.id,
      matchId: params.matchId
    }
  });

  return NextResponse.json({ ok: true });
}
