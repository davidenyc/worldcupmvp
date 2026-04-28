import { createHmac, randomUUID } from "node:crypto";

const DEFAULT_SECRET = "gameday-map-dev-elite-secret";

type AccessPayload = {
  userId: string;
  venueId: string;
  displayName: string;
  tier: "elite";
  nonce: string;
  exp: number;
};

function getSecret() {
  return process.env.ELITE_ACCESS_SECRET ?? DEFAULT_SECRET;
}

function signPayload(payload: AccessPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userId?: string;
    venueId?: string;
    displayName?: string;
    tier?: string;
  };

  if (!body.userId || !body.venueId || body.tier !== "elite") {
    return Response.json({ error: "Elite access requires an elite user and venue" }, { status: 403 });
  }

  const exp = Math.floor((Date.now() + 30_000) / 1000);
  const payload: AccessPayload = {
    userId: body.userId,
    venueId: body.venueId,
    displayName: body.displayName ?? "Elite member",
    tier: "elite",
    nonce: randomUUID(),
    exp
  };

  const token = signPayload(payload);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(token)}`;

  return Response.json({
    ok: true,
    token,
    qrUrl,
    expiresAt: new Date(exp * 1000).toISOString()
  });
}
