"use client";

import { ReactNode, useEffect, useState } from "react";

export function MapShell({
  banner,
  map,
  results,
  resultsCountLabel,
  filterDrawerOpen = false,
  hasActiveFilters = false,
  onClearFilters,
  onOpenFilters,
  onOpenResults,
  mobileResultsOpen = false,
  onCloseResults,
  desktopResultsExpanded = false,
  onDesktopResultsExpandedChange
}: {
  banner?: ReactNode;
  map: ReactNode;
  results: ReactNode;
  resultsCountLabel?: string;
  filterDrawerOpen?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onOpenFilters?: () => void;
  onOpenResults?: () => void;
  mobileResultsOpen?: boolean;
  onCloseResults?: () => void;
  desktopResultsExpanded?: boolean;
  onDesktopResultsExpandedChange?: (expanded: boolean) => void;
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

      {!desktopResultsCollapsed ? (
        <div
          className={`pointer-events-none fixed right-4 top-[81px] bottom-4 z-40 hidden lg:block ${
            desktopResultsExpanded ? "w-[min(34rem,calc(100vw-2rem))]" : "w-72"
          }`}
        >
          <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-2xl border border-[#d7e4f8] bg-[#f8fbff]/95 text-[#0a1628] shadow-xl backdrop-blur-md dark:border-white/8 dark:bg-[#161b22]/95 dark:text-white">
            <div className="border-b border-[#eef4ff] px-4 py-3 dark:border-white/8">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[#0a1628]/45 dark:text-white/45">Results</div>
                  <div className="text-sm font-semibold text-[#0a1628] dark:text-white">{resultsCountLabel ?? "Venues in view"}</div>
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && onClearFilters ? (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      Clear all
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDesktopResultsExpandedChange?.(!desktopResultsExpanded)}
                    className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    {desktopResultsExpanded ? "Compact" : "Expand"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopResultsCollapsed(true);
                      onDesktopResultsExpandedChange?.(false);
                    }}
                    className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    Hide
                  </button>
                </div>
              </div>
            </div>
            <div className={`min-h-0 flex-1 overflow-y-auto p-3 ${desktopResultsExpanded ? "pr-2" : ""}`}>{results}</div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDesktopResultsCollapsed(false);
            onDesktopResultsExpandedChange?.(true);
          }}
          className="fixed right-4 top-[81px] z-40 hidden rounded-full border border-[#d7e4f8] bg-white/95 px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white lg:inline-flex"
        >
          ▸ {resultsCountLabel ?? "Results"}
        </button>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="pointer-events-none flex items-end justify-between px-4 pb-4">
          <button
            type="button"
            onClick={onOpenFilters}
            className="pointer-events-auto rounded-full border border-[#d7e4f8] bg-white/95 px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white"
          >
            ⚙ Filters
          </button>
          <button
            type="button"
            onClick={onOpenResults}
            className="pointer-events-auto rounded-full border border-[#d7e4f8] bg-white/95 px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#161b22]/95 dark:text-white"
          >
            ▸ {resultsCountLabel ?? "Results"}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-[#0a1628]/12 transition-opacity duration-300 lg:hidden ${
          mobileResultsOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseResults}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-[1.75rem] border-t border-[#d7e4f8] bg-[#f8fbff]/95 text-[#0a1628] shadow-2xl backdrop-blur-md transition-transform duration-300 ease-in-out dark:border-white/8 dark:bg-[#161b22]/95 dark:text-white lg:hidden ${
          mobileResultsOpen ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#eef4ff] px-4 py-3 dark:border-white/8">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-[#0a1628]/45 dark:text-white/45">Results</div>
            <div className="text-sm font-semibold text-[#0a1628] dark:text-white">{resultsCountLabel ?? "Venues in view"}</div>
          </div>
          <button
            type="button"
            onClick={onCloseResults}
            className="rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#0a1628] dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(90vh-3.5rem)] overflow-y-auto p-3">{results}</div>
      </div>
    </div>
  );
}
