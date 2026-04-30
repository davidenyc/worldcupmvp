import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireNotificationUser } from "./_lib";

export async function GET(request: Request) {
  const user = await requireNotificationUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const take = Math.min(Number(searchParams.get("take") ?? 20), 50);

  const notifications = await prisma.notification.findMany({
    where: { profileId: user.id },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
  });

  const hasMore = notifications.length > take;
  const items = hasMore ? notifications.slice(0, take) : notifications;

  return NextResponse.json({
    notifications: items,
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null
  });
}
