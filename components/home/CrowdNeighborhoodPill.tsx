interface CrowdNeighborhoodPillProps {
  neighborhood: string | null;
}

export function CrowdNeighborhoodPill({ neighborhood }: CrowdNeighborhoodPillProps) {
  if (!neighborhood) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[var(--bg-surface-elevated)] px-3 py-1 text-xs font-semibold text-[color:var(--fg-secondary)]">
      <span aria-hidden="true">🔥</span>
      <span>{neighborhood} crowd is biggest</span>
    </div>
  );
}
