function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getSeededGoingCount(
  matchId: string,
  venueSlug: string,
  venue: { rankScore?: number }
) {
  const seed = stableHash(`${matchId}:${venueSlug}`);
  const rankFactor = clamp(venue.rankScore ?? 50, 30, 95) / 100;
  const weekday = new Date().getDay();
  const dayBoost = weekday === 5 || weekday === 6 || weekday === 0 ? 1.4 : 1;
  const base = (seed % 50) + 4;
  const count = Math.round(base * rankFactor * dayBoost);

  return clamp(count, 4, 84);
}
