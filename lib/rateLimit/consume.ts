import "server-only";

import { prisma } from "@/lib/prisma";

interface ConsumeArgs {
  key: string;
  limit: number;
  windowMs: number;
}

export function getRequestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
}

export async function consumeRateLimit({ key, limit, windowMs }: ConsumeArgs): Promise<boolean> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowMs);

  const existing = await prisma.rateLimit.findUnique({
    where: { key }
  });

  if (!existing || existing.windowStartedAt < cutoff) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStartedAt: now },
      update: { count: 1, windowStartedAt: now }
    });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } }
  });

  return true;
}
