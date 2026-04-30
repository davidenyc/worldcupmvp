import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

import { requireNotificationUser } from "../../_lib";

const subscribeSchema = z.object({
  provider: z.enum(["web", "apns", "fcm"]).default("web"),
  endpoint: z.string().min(1),
  p256dh: z.string().optional().nullable(),
  authKey: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable()
});

const unsubscribeSchema = z.object({
  endpoint: z.string().min(1)
});

export async function POST(request: Request) {
  const user = await requireNotificationUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = subscribeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const subscription = await prisma.pushSubscription.upsert({
    where: {
      profileId_endpoint: {
        profileId: user.id,
        endpoint: data.endpoint
      }
    },
    update: {
      provider: data.provider,
      p256dh: data.p256dh ?? null,
      authKey: data.authKey ?? null,
      userAgent: data.userAgent ?? null,
      lastUsedAt: new Date()
    },
    create: {
      profileId: user.id,
      provider: data.provider,
      endpoint: data.endpoint,
      p256dh: data.p256dh ?? null,
      authKey: data.authKey ?? null,
      userAgent: data.userAgent ?? null,
      lastUsedAt: new Date()
    }
  });

  return NextResponse.json({ subscription });
}

export async function DELETE(request: Request) {
  const user = await requireNotificationUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = unsubscribeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({
    where: {
      profileId: user.id,
      endpoint: parsed.data.endpoint
    }
  });

  return NextResponse.json({ ok: true });
}
