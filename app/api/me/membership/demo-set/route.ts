import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const membershipTierSchema = z.object({
  tier: z.enum(["free", "fan", "elite"])
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
  const parsed = membershipTierSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const membership = await prisma.profileMembership.upsert({
    where: { profileId: user.id },
    update: {
      tier: parsed.data.tier,
      upgradedAt: parsed.data.tier === "free" ? null : new Date()
    },
    create: {
      profileId: user.id,
      tier: parsed.data.tier,
      upgradedAt: parsed.data.tier === "free" ? null : new Date()
    }
  });

  return NextResponse.json({ membership });
}
