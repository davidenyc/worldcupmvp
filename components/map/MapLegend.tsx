export function MapLegend() {
  return (
    <div className="surface p-4">
      <div className="text-sm uppercase tracking-[0.2em] text-mist">Legend</div>
      <div className="mt-3 grid gap-2 text-sm text-navy/70">
        <div className="flex items-center gap-3">
          <span className="flag-marker"><span className="flag-marker__flag">🇵🇹</span></span>
          Country flag venue marker
        </div>
        <div className="flex items-center gap-3">
          <span className="flag-cluster">8</span>
          Clustered venues at lower zoom
        </div>
      </div>
    </div>
  );
}
