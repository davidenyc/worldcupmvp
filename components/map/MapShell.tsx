"use client";

import { ReactNode, useEffect, useState } from "react";

export function MapShell({
  banner,
  map,
  results,
  resultsCountLabel,
  filterDrawerOpen = false,
  hideMobileResultsButton = false,
  hasActiveFilters = false,
  onClearFilters,
  onOpenFilters,
  onOpenResults,
  mobileResultsOpen = false,
  onCloseResults,
  desktopResultsExpanded = false,
  onDesktopResultsExpandedChange,
  hideDesktopResults = false
}: {
  banner?: ReactNode;
  map: ReactNode;
  results: ReactNode;
  resultsCountLabel?: string;
  filterDrawerOpen?: boolean;
  hideMobileResultsButton?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onOpenFilters?: () => void;
  onOpenResults?: () => void;
  mobileResultsOpen?: boolean;
  onCloseResults?: () => void;
  desktopResultsExpanded?: boolean;
  onDesktopResultsExpandedChange?: (expanded: boolean) => void;
  hideDesktopResults?: boolean;
}) {
  const [desktopResultsCollapsed, setDesktopResultsCollapsed] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopResultsCollapsed(false);
        onDesktopResultsExpandedChange?.(false);
        onCloseResults?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCloseResults, onDesktopResultsExpandedChange]);

  return (
    <div className="map-shell-frame relative overflow-hidden">
      <div className="absolute inset-0">{map}</div>

      {banner ? <div className="absolute inset-x-4 top-4 z-40">{banner}</div> : null}

      {!hideDesktopResults && !desktopResultsCollapsed ? (
        <div
          className={`pointer-events-none fixed right-4 top-[81px] bottom-4 z-40 hidden lg:block ${
            desktopResultsExpanded ? "w-[min(34rem,calc(100vw-2rem))]" : "w-72"
          }`}
        >
          <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161b22]/96 text-white backdrop-blur-md">
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/45">Results</div>
                  <div className="text-sm font-semibold text-white">{resultsCountLabel ?? "Venues in view"}</div>
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && onClearFilters ? (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      Clear all
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDesktopResultsExpandedChange?.(!desktopResultsExpanded)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    {desktopResultsExpanded ? "Compact" : "Expand"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopResultsCollapsed(true);
                      onDesktopResultsExpandedChange?.(false);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    Hide
                  </button>
                </div>
              </div>
            </div>
            <div className={`min-h-0 flex-1 overflow-y-auto p-3 ${desktopResultsExpanded ? "pr-2" : ""}`}>{results}</div>
          </div>
        </div>
      ) : !hideDesktopResults ? (
        <button
          type="button"
          onClick={() => {
            setDesktopResultsCollapsed(false);
            onDesktopResultsExpandedChange?.(true);
          }}
          className="fixed right-4 top-[81px] z-40 hidden rounded-full border border-white/10 bg-[#161b22]/96 px-4 py-2 text-sm font-semibold text-white backdrop-blur lg:inline-flex"
        >
          ▸ {resultsCountLabel ?? "Results"}
        </button>
      ) : null}

      {!hideMobileResultsButton ? (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div className="pointer-events-none flex items-end justify-end px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onOpenResults}
              className="pointer-events-auto rounded-full border border-white/10 bg-[#161b22]/96 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md"
            >
              ▸ Results
            </button>
          </div>
        </div>
      ) : null}

      <div
        className={`fixed inset-0 z-40 bg-[#0a1628]/12 transition-opacity duration-300 lg:hidden ${
          mobileResultsOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseResults}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[94vh] overflow-hidden rounded-t-[1.75rem] border-t border-white/10 bg-[#161b22]/96 text-white backdrop-blur-md transition-transform duration-300 ease-in-out lg:hidden ${
          mobileResultsOpen ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-14 rounded-full bg-white/15" />
        </div>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Results</div>
            <div className="text-sm font-semibold text-white">{resultsCountLabel ?? "Venues in view"}</div>
          </div>
          <button
            type="button"
            onClick={onCloseResults}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(94vh-3.5rem)] overflow-y-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">{results}</div>
      </div>
    </div>
  );
}
