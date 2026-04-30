import "server-only";

export function getEliteAccessSecret() {
  const secret = process.env.ELITE_ACCESS_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ELITE_ACCESS_SECRET is required in production");
    }

    return "dev-only-fallback-not-for-production";
  }

  if (secret.length < 32) {
    throw new Error("ELITE_ACCESS_SECRET must be at least 32 characters");
  }

  return secret;
}
