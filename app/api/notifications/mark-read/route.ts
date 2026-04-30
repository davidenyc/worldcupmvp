import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

import { requireNotificationUser } from "../_lib";

const markReadSchema = z.object({
  ids: z.array(z.string().min(1)).optional(),
  all: z.boolean().optional()
});

export async function POST(request: Request) {
  const user = await requireNotificationUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = markReadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.all) {
    await prisma.notification.updateMany({
      where: {
        profileId: user.id,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });
    return NextResponse.json({ ok: true });
  }

  if (!parsed.data.ids?.length) {
    return NextResponse.json({ error: "No notification ids provided" }, { status: 400 });
  }

  await prisma.notification.updateMany({
    where: {
      profileId: user.id,
      id: { in: parsed.data.ids }
    },
    data: {
      readAt: new Date()
    }
  });

  return NextResponse.json({ ok: true });
}
