import "server-only";

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

export async function sendWebPush(_subscription: WebPushSubscriptionRow, _input: WebPushInput) {
  // Implemented in the next commit with VAPID-backed web push.
}
