import "server-only";

import webpush from "web-push";

import { prisma } from "@/lib/prisma";

interface WebPushSubscriptionRow {
  endpoint: string;
  p256dh: string | null;
  authKey: string | null;
  provider: string;
}

interface WebPushInput {
  kind: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  href?: string;
}

let configured = false;
let warnedMissingVapidEnv = false;

function ensureConfigured() {
  if (configured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    if (!warnedMissingVapidEnv) {
      warnedMissingVapidEnv = true;
      console.warn("Notifications web push disabled: missing VAPID env.");
    }
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export async function sendWebPush(subscription: WebPushSubscriptionRow, input: WebPushInput) {
  if (!ensureConfigured()) return;
  if (subscription.provider !== "web" || !subscription.endpoint || !subscription.p256dh || !subscription.authKey) {
    return;
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.authKey
        }
      },
      JSON.stringify({
        title: input.title,
        body: input.body,
        href: input.href,
        tag: input.kind
      })
    );
  } catch (error) {
    const statusCode = typeof error === "object" && error && "statusCode" in error
      ? Number((error as { statusCode?: number }).statusCode)
      : null;

    if (statusCode === 404 || statusCode === 410) {
      await prisma.pushSubscription.deleteMany({
        where: {
          endpoint: subscription.endpoint
        }
      });
      return;
    }

    throw error;
  }
}
