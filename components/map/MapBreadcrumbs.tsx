import { ChevronRight } from "lucide-react";

import { GeoHierarchyNode } from "@/lib/maps/types";

export function MapBreadcrumbs({ items }: { items: GeoHierarchyNode[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-navy/65">
      {items.map((item, index) => (
        <div key={item.slug} className="inline-flex items-center gap-2">
          <span>{item.label}</span>
          {index < items.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-mist" />}
        </div>
      ))}
    </div>
  );
}
