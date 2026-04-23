const lastCallByKey = new Map<string, number>();

export async function rateLimit(key: string, minIntervalMs = 150) {
  const now = Date.now();
  const last = lastCallByKey.get(key) ?? 0;
  const waitMs = Math.max(0, minIntervalMs - (now - last));

  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  lastCallByKey.set(key, Date.now());
}
