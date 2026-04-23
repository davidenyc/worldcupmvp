"use client";

import { Filter, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MapToolbar({
  query,
  onQueryChange,
  onReset,
  totalResults
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  totalResults: number;
}) {
  return (
    <div className="surface sticky top-20 z-20 space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-mist">Map controls</div>
          <div className="text-lg font-semibold text-deep">{totalResults} venues in view</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="ghost" onClick={onReset}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search venues, neighborhoods, cuisine"
          className="pl-10"
        />
      </div>
    </div>
  );
}
