// Minimal ambient declarations for react-simple-maps. The upstream package
// ships without types in v3.x on DefinitelyTyped, so this shim keeps
// `tsc --noEmit` and `next build` happy without loosening strictness
// project-wide.
declare module "react-simple-maps" {
  import { CSSProperties, ReactNode, SVGProps } from "react";

  export interface GeographyFeature {
    rsmKey: string;
    type: string;
    properties: Record<string, unknown> & { name?: string; iso_a2?: string };
    geometry: unknown;
  }

  export interface GeographiesChildProps {
    geographies: GeographyFeature[];
    projection: unknown;
    path: (geography: GeographyFeature) => string;
  }

  export interface ComposableMapProps extends React.HTMLAttributes<SVGSVGElement> {
    projection?: string | ((...args: any[]) => any);
    projectionConfig?: Record<string, unknown>;
    width?: number;
    height?: number;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }
  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface GeographiesProps {
    geography: string | object;
    children: (props: GeographiesChildProps) => ReactNode;
    parseGeographies?: (features: unknown) => unknown;
  }
  export const Geographies: React.FC<GeographiesProps>;

  export interface GeographyStyle {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  }

  export interface GeographyProps extends Omit<SVGProps<SVGPathElement>, "style"> {
    geography: GeographyFeature;
    style?: GeographyStyle;
  }
  export const Geography: React.FC<GeographyProps>;

  export interface MarkerProps extends SVGProps<SVGGElement> {
    coordinates: [number, number];
    children?: ReactNode;
  }
  export const Marker: React.FC<MarkerProps>;

  export const ZoomableGroup: React.FC<{
    center?: [number, number];
    zoom?: number;
    children?: ReactNode;
  }>;
  export const Sphere: React.FC<SVGProps<SVGCircleElement>>;
  export const Graticule: React.FC<SVGProps<SVGPathElement>>;
  export const Annotation: React.FC<{ subject: [number, number]; children?: ReactNode }>;
  export const Line: React.FC<SVGProps<SVGPathElement> & { from: [number, number]; to: [number, number] }>;
}
