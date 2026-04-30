import { NextResponse } from "next/server";

import { dispatch } from "@/lib/notifications/dispatcher";

import { requireNotificationUser } from "../_lib";

export async function POST() {
  const user = await requireNotificationUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
