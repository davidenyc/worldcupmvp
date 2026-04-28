import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    promoId?: string;
    userId?: string;
    redeemedAt?: string;
    venueId?: string;
  };

  if (!body.promoId || !body.userId) {
    return Response.json({ error: "promoId and userId are required" }, { status: 400 });
  }

  const record = {
    promoId: body.promoId,
    userId: body.userId,
    venueId: body.venueId ?? null,
    redeemedAt: body.redeemedAt ?? new Date().toISOString()
  };

  const dataDir = path.join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });
  await appendFile(path.join(dataDir, "promo-redemptions.jsonl"), `${JSON.stringify(record)}\n`, "utf8");

  return Response.json({ ok: true, record });
}
