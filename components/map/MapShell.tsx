"use client";

import { useEffect, useState } from "react";
import { ReactNode } from "react";

export function MapShell({
  sidebar,
  map,
  results
}: {
  sidebar: ReactNode;
  map: ReactNode;
  results: ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[280px,minmax(0,1fr),380px]">
        <aside className="hidden space-y-4 xl:block">{sidebar}</aside>
        <section className="min-w-0">{map}</section>
        <aside className="space-y-4">
          <div className="hidden xl:block">{results}</div>
        </aside>
      </div>
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="fixed bottom-4 left-4 z-40 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-navy shadow-lg xl:hidden"
      >
        ⚙ Filters
      </button>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/20 transition-opacity duration-300 xl:hidden ${
          mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] border-t border-white/80 bg-white/95 p-4 shadow-2xl backdrop-blur transition-transform duration-300 ease-in-out xl:hidden ${
          mobileSidebarOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-mist">Filters</div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded-full border border-line bg-white px-3 py-1 text-sm font-semibold text-navy"
          >
            Close
          </button>
        </div>
        <div>{sidebar}</div>
      </div>
    </>
  );
}
