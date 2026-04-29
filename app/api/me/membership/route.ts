import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

  const membership = await prisma.profileMembership.upsert({
    where: { profileId: user.id },
    update: {},
    create: {
      profileId: user.id,
      tier: "free"
    }
  });

  return NextResponse.json({ membership });
}
