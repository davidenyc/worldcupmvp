import "server-only";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/notifications/channels/email";
import { writeInApp } from "@/lib/notifications/channels/inApp";
import { sendWebPush } from "@/lib/notifications/channels/webPush";

export type NotificationKind =
  | "kickoff_1h"
  | "kickoff_30m"
  | "match_day_digest"
  | "promo_expiring"
  | "new_promo_at_saved"
  | "friend_request_received"
  | "watch_party_invite"
  | "watch_party_rsvp"
  | "subscription_renewing";

export interface DispatchInput {
  profileId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  href?: string;
}

type NotificationPrefs = {
  channels?: {
    push?: boolean;
    email?: boolean;
    in_app?: boolean;
  };
  perKind?: Record<string, { push?: boolean; email?: boolean }>;
};

export async function dispatch(input: DispatchInput) {
  const profile = await prisma.profile.findUnique({
    where: { id: input.profileId },
    include: { pushSubscriptions: true }
  });

  if (!profile) return;

  const prefs = (profile.notificationPrefs as NotificationPrefs | null) ?? {};
  const kindPrefs = prefs.perKind?.[input.kind] ?? { push: true, email: false };
  const globalPush = prefs.channels?.push !== false;
  const globalEmail = prefs.channels?.email !== false;
  const globalInApp = prefs.channels?.in_app !== false;

  const channels: string[] = [];
  if (globalInApp) channels.push("in_app");
  if (globalPush && kindPrefs.push) channels.push("push");
  if (globalEmail && kindPrefs.email) channels.push("email");

  if (channels.includes("in_app")) {
    await writeInApp(profile.id, input);
  }

  if (channels.includes("push")) {
    for (const subscription of profile.pushSubscriptions) {
      if (subscription.provider === "web") {
        await sendWebPush(
          {
            endpoint: subscription.endpoint,
            p256dh: subscription.p256dh,
            authKey: subscription.authKey,
            provider: subscription.provider
          },
          input
        ).catch(console.error);
      }
      // TODO(native-ios): wire APNs send when the native iOS sprint lands.
    }
  }

  if (channels.includes("email")) {
    await sendEmail(profile.id, input).catch(console.error);
  }
}
