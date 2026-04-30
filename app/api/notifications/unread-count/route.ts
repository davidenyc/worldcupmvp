import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireNotificationUser } from "../_lib";

export async function GET() {
  const user = await requireNotificationUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await prisma.notification.count({
    where: {
      profileId: user.id,
      readAt: null
    }
  });

  return NextResponse.json({ count });
}
