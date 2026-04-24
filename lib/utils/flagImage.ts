// Countries that need image-based flag rendering because their emoji
// uses Unicode sub-regional tag sequences not supported on Chrome/Windows.
const FLAG_IMAGE_OVERRIDES: Record<string, string> = {
  england: "https://flagcdn.com/h24/gb-eng.png",
  scotland: "https://flagcdn.com/h24/gb-sct.png",
  wales: "https://flagcdn.com/h24/gb-wls.png"
};

const FIFA_CODE_OVERRIDES: Record<string, string> = {
  ENG: "https://flagcdn.com/h24/gb-eng.png",
  SCO: "https://flagcdn.com/h24/gb-sct.png",
  WAL: "https://flagcdn.com/h24/gb-wls.png"
};

export function getFlagImageUrl(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return FLAG_IMAGE_OVERRIDES[slug.toLowerCase()] ?? null;
}

export function getFlagImageUrlByCode(fifaCode: string | null | undefined): string | null {
  if (!fifaCode) return null;
  return FIFA_CODE_OVERRIDES[fifaCode.toUpperCase()] ?? null;
}

export function needsFlagImageOverride(slug: string | null | undefined): boolean {
  return !!getFlagImageUrl(slug);
}
