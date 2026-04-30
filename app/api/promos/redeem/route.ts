import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getPromoSeedById, type SavedPromo } from "@/lib/data/promos";
import { createClient } from "@/lib/supabase/server";
import type { MembershipTier } from "@/lib/store/membership";

function hasTierAccess(required: MembershipTier, actual: MembershipTier) {
  if (required === "free") return true;
  if (required === "fan") return actual === "fan" || actual === "elite";
  return actual === "elite";
}

function buildRedemptionCode(promoId: string) {
  return `${promoId.replace(/^promo-/, "").replace(/-/g, "").slice(0, 6).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
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
  const tier = (membership?.tier ?? "free") as MembershipTier;

  const body = (await request.json()) as {
    promoId?: string;
    claimedAt?: string;
  };

  if (!body.promoId) {
    return NextResponse.json({ error: "promoId required" }, { status: 400 });
  }

  const promo = getPromoSeedById(body.promoId);
  if (!promo) {
    return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  }

  const now = new Date();
  if (Date.parse(promo.startsAt) > now.getTime() || Date.parse(promo.endsAt) < now.getTime()) {
    return NextResponse.json({ error: "Promo is not active" }, { status: 409 });
  }

  if (!hasTierAccess(promo.tier, tier)) {
    return NextResponse.json({ error: "Tier not eligible for this promo" }, { status: 403 });
  }

  const userClaimsForPromo = await prisma.promoRedemption.count({
    where: {
      profileId: user.id,
      promoId: body.promoId
    }
  });
  if (userClaimsForPromo >= promo.perUserLimit) {
    return NextResponse.json({ error: "Per-user promo limit reached" }, { status: 409 });
  }

  if (promo.totalLimit) {
    const totalClaims = await prisma.promoRedemption.count({
      where: { promoId: body.promoId }
    });
    if (totalClaims >= promo.totalLimit) {
      return NextResponse.json({ error: "Promo has reached its global limit" }, { status: 409 });
    }
  }

  const claimedAt = body.claimedAt ?? now.toISOString();
  const savedPromo: SavedPromo = {
    promoId: promo.id,
    venueSlug: promo.venueSlug,
    code: buildRedemptionCode(promo.id),
    claimedAt,
    expiresAt: promo.endsAt
  };

  try {
    await prisma.promoRedemption.create({
      data: {
        profileId: user.id,
        promoId: promo.id,
        redemptionCode: savedPromo.code,
        claimedAt: new Date(claimedAt),
        expiresAt: new Date(savedPromo.expiresAt)
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Per-user promo limit reached" }, { status: 409 });
    }
    throw error;
  }

  // TODO(migrate-jsonl): import existing data from data/promo-redemptions.jsonl before deleting any historic backups.
  return NextResponse.json({ savedPromo, redemptionCode: savedPromo.code });
}
