"use client";

import { CalendarDays, MapPin, SlidersHorizontal } from "lucide-react";
import { ReactNode, TouchEvent, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

function useSwipeDown(onSwipeDown?: () => void) {
  const startYRef = useRef<number | null>(null);

  return {
    onTouchStart(event: TouchEvent<HTMLDivElement>) {
      startYRef.current = event.touches[0]?.clientY ?? null;
    },
    onTouchEnd(event: TouchEvent<HTMLDivElement>) {
      const endY = event.changedTouches[0]?.clientY ?? null;
      if (startYRef.current !== null && endY !== null && endY - startYRef.current > 70) {
        onSwipeDown?.();
      }
      startYRef.current = null;
    }
  };
}

export function MapShell({
  banner,
  map,
  results,
  resultsCountLabel,
  hideMobileResultsButton = false,
  hasActiveFilters = false,
  onClearFilters,
  onOpenFilters,
  onOpenResults,
  onOpenGames,
  mobileResultsOpen = false,
  mobileGamesOpen = false,
  onCloseResults,
  desktopResultsExpanded = false,
  onDesktopResultsExpandedChange,
  hideDesktopResults = false,
  mobileFilterOpen = false
}: {
  banner?: ReactNode;
  map: ReactNode;
  results: ReactNode;
  resultsCountLabel?: string;
  hideMobileResultsButton?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onOpenFilters?: () => void;
  onOpenResults?: () => void;
  onOpenGames?: () => void;
  mobileResultsOpen?: boolean;
  mobileGamesOpen?: boolean;
  onCloseResults?: () => void;
  desktopResultsExpanded?: boolean;
  onDesktopResultsExpandedChange?: (expanded: boolean) => void;
  hideDesktopResults?: boolean;
  mobileFilterOpen?: boolean;
}) {
  const [desktopResultsCollapsed, setDesktopResultsCollapsed] = useState(false);
  const resultsSwipe = useSwipeDown(onCloseResults);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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

      {isDesktop && !hideDesktopResults && !desktopResultsCollapsed ? (
        <div
          className={`pointer-events-none fixed right-4 top-[81px] bottom-4 z-40 hidden lg:block ${
            desktopResultsExpanded ? "w-[min(34rem,calc(100vw-2rem))]" : "w-72"
          }`}
        >
          <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-2xl border border-[#d8e3f5] bg-white text-[#0a1628] shadow-2xl dark:border-white/10 dark:bg-[#161b22]/96 dark:text-white">
            <div className="border-b border-[#d8e3f5] px-4 py-3 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[#0a1628]/45 dark:text-white/45">Results</div>
                  <div className="text-sm font-semibold text-[#0a1628] dark:text-white">{resultsCountLabel ?? "Venues in view"}</div>
                </div>
                <div className={`grid gap-2 ${hasActiveFilters && onClearFilters ? "grid-cols-2" : "grid-cols-2"}`}>
                  {hasActiveFilters && onClearFilters ? (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-4 text-sm font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      Clear
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDesktopResultsExpandedChange?.(!desktopResultsExpanded)}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-4 text-sm font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    {desktopResultsExpanded ? "Compact" : "Expand"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopResultsCollapsed(true);
                      onDesktopResultsExpandedChange?.(false);
                    }}
                    className={`inline-flex h-12 items-center justify-center rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-4 text-sm font-semibold text-[#0a1628] transition hover:bg-[#eef4ff] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 ${
                      hasActiveFilters && onClearFilters ? "col-span-2" : ""
                    }`}
                  >
                    Hide
                  </button>
                </div>
              </div>
            </div>
            <div className={`min-h-0 flex-1 overflow-y-auto p-3 ${desktopResultsExpanded ? "pr-2" : ""}`}>{results}</div>
          </div>
        </div>
      ) : isDesktop && !hideDesktopResults ? (
        <button
          type="button"
          onClick={() => {
            setDesktopResultsCollapsed(false);
            onDesktopResultsExpandedChange?.(true);
          }}
          className="fixed right-4 top-[81px] z-40 hidden rounded-full border border-[#d8e3f5] bg-white/95 px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#161b22]/96 dark:text-white lg:inline-flex"
        >
          ▸ {resultsCountLabel ?? "Results"}
        </button>
      ) : null}

      {!isDesktop && !hideMobileResultsButton ? (
        <div className="fixed left-3 top-[calc(env(safe-area-inset-top,0px)+5.5rem)] z-40 lg:hidden">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onOpenGames}
              aria-label="Open games"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition ${
                mobileGamesOpen
                  ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                  : "border-[#d8e3f5] bg-white/95 text-[#0a1628]"
              }`}
            >
              <CalendarDays className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onOpenFilters}
              aria-label="Open filters"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition ${
                mobileFilterOpen
                  ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                  : "border-[#d8e3f5] bg-white/95 text-[#0a1628]"
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onOpenResults}
              aria-label={`Open venues list${resultsCountLabel ? `, ${resultsCountLabel}` : ""}`}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition ${
                mobileResultsOpen
                  ? "border-[#f4b942] bg-[#f4b942] text-[#0a1628]"
                  : "border-[#d8e3f5] bg-white/95 text-[#0a1628]"
              }`}
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      {!isDesktop ? (
        <>
          <div
            className={`fixed inset-0 z-40 bg-[#0a1628]/12 dark:bg-black/35 transition-opacity duration-300 lg:hidden ${
              mobileResultsOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={onCloseResults}
          />

          <div
            className={`fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden rounded-t-[1.75rem] border-t border-[#d8e3f5] bg-white/97 text-[#0a1628] shadow-2xl backdrop-blur-md transition-transform duration-300 ease-in-out lg:hidden ${
              mobileResultsOpen ? "translate-y-0" : "pointer-events-none translate-y-full"
            }`}
            {...resultsSwipe}
          >
            <div className="flex justify-center pt-4">
              <div className="h-1.5 w-14 rounded-full bg-[#0a1628]/12" />
            </div>
            <div className="flex items-center justify-between border-b border-[#d8e3f5] px-4 py-3.5">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#0a1628]/45">Results</div>
                <div className="text-sm font-semibold text-[#0a1628]">{resultsCountLabel ?? "Venues in view"}</div>
              </div>
              <button
                type="button"
                onClick={onCloseResults}
                className="h-10 rounded-full border border-[#d8e3f5] bg-[#f8fbff] px-4 text-xs font-semibold text-[#0a1628]"
              >
                Close
              </button>
            </div>
            <div className="pb-safe max-h-[calc(80vh-4.5rem)] overflow-y-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">{results}</div>
          </div>
        </>
      ) : null}
    </div>
  );
}
