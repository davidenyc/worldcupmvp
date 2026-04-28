import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import { getPromoSeedById, type SavedPromo } from "@/lib/data/promos";
import type { MembershipTier } from "@/lib/store/membership";

type RedemptionLogRecord = SavedPromo & {
  userId: string;
  tier: MembershipTier;
};

function hasTierAccess(required: MembershipTier, actual: MembershipTier) {
  if (required === "free") return true;
  if (required === "fan") return actual === "fan" || actual === "elite";
  return actual === "elite";
}

function buildRedemptionCode(promoId: string) {
  return `${promoId.replace(/^promo-/, "").replace(/-/g, "").slice(0, 6).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

async function readRedemptionLog(filePath: string) {
  try {
    const raw = await readFile(filePath, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as RedemptionLogRecord);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    promoId?: string;
    userId?: string;
    tier?: MembershipTier;
    claimedAt?: string;
  };

  if (!body.promoId || !body.userId) {
    return Response.json({ error: "promoId and userId are required" }, { status: 400 });
  }

  const promo = getPromoSeedById(body.promoId);
  if (!promo) {
    return Response.json({ error: "Promo not found" }, { status: 404 });
  }

  const now = new Date();
  if (Date.parse(promo.startsAt) > now.getTime() || Date.parse(promo.endsAt) < now.getTime()) {
    return Response.json({ error: "Promo is not active" }, { status: 409 });
  }

  const tier = body.tier ?? "free";
  if (!hasTierAccess(promo.tier, tier)) {
    return Response.json({ error: "Tier not eligible for this promo" }, { status: 403 });
  }

  const dataDir = path.join(process.cwd(), "data");
  const redemptionLogPath = path.join(dataDir, "promo-redemptions.jsonl");
  await mkdir(dataDir, { recursive: true });

  const existingClaims = await readRedemptionLog(redemptionLogPath);
  const userClaimsForPromo = existingClaims.filter(
    (claim) => claim.userId === body.userId && claim.promoId === body.promoId
  );
  if (userClaimsForPromo.length >= promo.perUserLimit) {
    return Response.json({ error: "Per-user promo limit reached" }, { status: 409 });
  }

  if (promo.totalLimit) {
    const totalClaims = existingClaims.filter((claim) => claim.promoId === body.promoId).length;
    if (totalClaims >= promo.totalLimit) {
      return Response.json({ error: "Promo has reached its global limit" }, { status: 409 });
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

  const record: RedemptionLogRecord = {
    ...savedPromo,
    userId: body.userId,
    tier
  };

  await appendFile(redemptionLogPath, `${JSON.stringify(record)}\n`, "utf8");

  return Response.json({ savedPromo });
}
