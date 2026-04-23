import { GeoHierarchyNode } from "@/lib/maps/types";

export function buildGeoHierarchy({
  serviceAreaLabel,
  borough
}: {
  serviceAreaLabel: string;
  borough?: string;
}): GeoHierarchyNode[] {
  const nodes: GeoHierarchyNode[] = [
    { label: "World", slug: "world" },
    { label: "United States", slug: "united-states" },
    { label: "New York", slug: "new-york" },
    { label: serviceAreaLabel, slug: serviceAreaLabel.toLowerCase().replace(/\s+/g, "-") }
  ];

  if (borough) {
    nodes.push({ label: borough, slug: borough.toLowerCase().replace(/\s+/g, "-") });
  }

  return nodes;
}
