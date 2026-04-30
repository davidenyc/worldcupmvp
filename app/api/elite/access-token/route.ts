import { createHmac, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getEliteAccessSecret } from "@/lib/elite/secret";
import { createClient } from "@/lib/supabase/server";

type AccessPayload = {
  userId: string;
  venueId: string;
  displayName: string;
  tier: "elite";
  nonce: string;
  exp: number;
};

const ELITE_ACCESS_SECRET = getEliteAccessSecret();

function signPayload(payload: AccessPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", ELITE_ACCESS_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.profileMembership.findUnique({
    where: { profileId: user.id }
  });
  if (membership?.tier !== "elite") {
    return NextResponse.json({ error: "Elite access required" }, { status: 403 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  });

  const body = (await request.json()) as {
    venueId?: string;
  };

  if (!body.venueId) {
    return NextResponse.json({ error: "venueId required" }, { status: 400 });
  }

  const exp = Math.floor((Date.now() + 30_000) / 1000);
  const payload: AccessPayload = {
    userId: user.id,
    venueId: body.venueId,
    displayName: profile?.displayName ?? profile?.firstName ?? "Elite member",
    tier: "elite",
    nonce: randomUUID(),
    exp
  };

  const token = signPayload(payload);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(token)}`;

  return NextResponse.json({
    ok: true,
    token,
    qrUrl,
    expiresAt: new Date(exp * 1000).toISOString()
  });
}
