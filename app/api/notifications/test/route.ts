import { NextResponse } from "next/server";

import { dispatch } from "@/lib/notifications/dispatcher";
import { consumeRateLimit } from "@/lib/rateLimit/consume";

import { requireNotificationUser } from "../_lib";

export async function POST() {
  const user = await requireNotificationUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await consumeRateLimit({
    key: `notifications-test:${user.id}`,
    limit: 5,
    windowMs: 60 * 60_000
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  await dispatch({
    profileId: user.id,
    kind: "kickoff_30m",
    title: "Kickoff in 30 minutes",
    body: "This is a test notification from your GameDay Map settings.",
    payload: {
      test: true
    },
    href: "/me"
  });

  return NextResponse.json({ ok: true });
}
