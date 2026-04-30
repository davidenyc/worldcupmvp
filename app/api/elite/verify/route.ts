import { createHmac, timingSafeEqual } from "node:crypto";
import { getEliteAccessSecret } from "@/lib/elite/secret";

const ELITE_ACCESS_SECRET = getEliteAccessSecret();

type AccessPayload = {
  userId: string;
  venueId: string;
  displayName: string;
  tier: "elite";
  nonce: string;
  exp: number;
};

function verifyToken(token: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return { ok: false as const, reason: "Malformed token" };
  const expected = createHmac("sha256", ELITE_ACCESS_SECRET).update(encoded).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return { ok: false as const, reason: "Invalid signature" };
  }
  const matches = timingSafeEqual(signatureBuffer, expectedBuffer);
  if (!matches) return { ok: false as const, reason: "Invalid signature" };

  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AccessPayload;
  if (payload.exp * 1000 < Date.now()) return { ok: false as const, reason: "Expired token" };
  return { ok: true as const, payload };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string };
  if (!body.token) {
    return Response.json({ ok: false, reason: "Token required" }, { status: 400 });
  }

  const result = verifyToken(body.token);
  if (!result.ok) {
    return Response.json(result, { status: 400 });
  }

  return Response.json({
    ok: true,
    venueId: result.payload.venueId,
    userId: result.payload.userId,
    displayName: result.payload.displayName,
    expiresAt: new Date(result.payload.exp * 1000).toISOString()
  });
}
