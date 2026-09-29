import type { FacetSchema } from "$lib/providers/facets";
import type { SerialisedFacet } from "$lib/utils/leafletFacets";

export const NS = "pub.leaflet.richtext.facet";
export const CANVAS = "pub.leaflet.pages.canvas";
export const MAX_PAGE_DEPTH = 8;

export const SCHEMA: FacetSchema = {
  facet: NS,
  byteSlice: `${NS}#byteSlice`,
  bold: `${NS}#bold`,
  italic: `${NS}#italic`,
  code: `${NS}#code`,
  strike: `${NS}#strikethrough`,
  link: `${NS}#link`,
  // The native reader handles these. They remain lossy only in the separate
  // Leaflet→Markdown provider, where Markdown has no faithful equivalent.
  lossy: {
    [`${NS}#highlight`]: "highlight",
    [`${NS}#underline`]: "underline",
    [`${NS}#atMention`]: "mentions",
    [`${NS}#didMention`]: "mentions",
    [`${NS}#footnote`]: "footnotes",
  },
};

export type Obj = { [key: string]: unknown };

export const B = (name: string) => `pub.leaflet.blocks.${name}`;

export const getPlaintext = (inner: Obj): string =>
  typeof inner.plaintext === "string" ? inner.plaintext : "";

export const getFacets = (inner: Obj): SerialisedFacet[] | undefined =>
  Array.isArray(inner.facets) ? (inner.facets as SerialisedFacet[]) : undefined;

export function getAspectRatio(
  inner: Obj,
): { width: number; height: number } | undefined {
  const ratio = inner.aspectRatio;
  if (
    typeof ratio === "object" &&
    ratio !== null &&
    "width" in ratio &&
    "height" in ratio
  ) {
    const { width, height } = ratio as { width: unknown; height: unknown };
    if (
      typeof width === "number" &&
      typeof height === "number" &&
      width > 0 &&
      height > 0
    ) {
      return { width, height };
    }
  }
  return undefined;
}

export function alignmentClass(alignment?: string): string {
  if (!alignment) return "";
  if (alignment.endsWith("textAlignCenter")) return "text-center";
  if (alignment.endsWith("textAlignRight")) return "text-right";
  if (alignment.endsWith("textAlignJustify")) return "text-justify";
  return "";
}

export function textSizeClass(size: unknown): string {
  if (size === "small") return "leaflet-text--small";
  if (size === "large") return "leaflet-text--large";
  return "";
}
