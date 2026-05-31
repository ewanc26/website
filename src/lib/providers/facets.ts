/**
 * Generic richtext-facet engine shared by the leaflet, pckt and offprint
 * providers. All three store inline formatting the same way — a `plaintext`
 * string plus an array of facets, each a UTF-8 `byteSlice` range carrying one
 * or more feature objects (bold, italic, link, …). Only the `$type` strings
 * differ, so a {@link FacetSchema} config adapts the engine to each format.
 *
 * `facetsToPhrasing` turns stored facets into mdast phrasing nodes (for
 * rendering to markdown); `phrasingToFacets` does the reverse (parsing edited
 * markdown back into plaintext + facets). Features with no markdown equivalent
 * (highlight, underline, mentions) keep their text but are reported as lost.
 */

import type {
  Delete,
  Emphasis,
  InlineCode,
  Link,
  PhrasingContent,
  Strong,
} from "mdast";

export interface ByteSlice {
  byteStart: number;
  byteEnd: number;
}

export interface FacetFeature {
  $type?: string;
  [k: string]: unknown;
}

export interface Facet {
  $type?: string;
  index: ByteSlice;
  features: FacetFeature[];
}

/**
 * Maps a format's facet `$type` strings to the markdown marks we support. Any
 * feature `$type` present in `lossy` is preserved as plain text but recorded as
 * a dropped feature.
 */
export interface FacetSchema {
  facet: string;
  byteSlice: string;
  bold: string;
  italic: string;
  code: string;
  strike: string;
  /** Link feature `$type`; the uri lives on a `uri` property. */
  link: string;
  /** feature `$type` → human label, for features markdown can't represent. */
  lossy: Record<string, string>;
}

const encoder = new TextEncoder();
function byteLength(s: string): number {
  return encoder.encode(s).length;
}

// ---- facets → mdast phrasing ----

interface MarkSet {
  bold: boolean;
  italic: boolean;
  code: boolean;
  strike: boolean;
  /** Link uri, if any. */
  link?: string;
}

function emptyMarks(): MarkSet {
  return { bold: false, italic: false, code: false, strike: false };
}

function sameMarks(a: MarkSet, b: MarkSet): boolean {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.code === b.code &&
    a.strike === b.strike &&
    a.link === b.link
  );
}

/**
 * Convert a `plaintext`/`facets` pair to mdast phrasing content. Records the
 * labels of any features that couldn't be represented as markdown in `lost`.
 */
export function facetsToPhrasing(
  plaintext: string,
  facets: Facet[] | undefined,
  schema: FacetSchema,
  lost: Set<string>,
): PhrasingContent[] {
  if (!plaintext) return [];
  if (!facets || facets.length === 0) {
    return [{ type: "text", value: plaintext }];
  }

  // Resolve each facet's features into a mark contribution, collecting lossy
  // features as we go.
  const ranges: { start: number; end: number; marks: Partial<MarkSet> }[] = [];
  for (const f of facets) {
    const marks: Partial<MarkSet> = {};
    for (const feat of f.features ?? []) {
      switch (feat.$type) {
        case schema.bold:
          marks.bold = true;
          break;
        case schema.italic:
          marks.italic = true;
          break;
        case schema.code:
          marks.code = true;
          break;
        case schema.strike:
          marks.strike = true;
          break;
        case schema.link:
          if (typeof feat.uri === "string") marks.link = feat.uri;
          break;
        default:
          if (feat.$type && schema.lossy[feat.$type])
            lost.add(schema.lossy[feat.$type]);
      }
    }
    if (Object.keys(marks).length > 0)
      ranges.push({ start: f.index.byteStart, end: f.index.byteEnd, marks });
  }

  // Boundaries (in bytes) where the active mark-set may change.
  const bounds = new Set<number>([0, byteLength(plaintext)]);
  for (const r of ranges) {
    bounds.add(r.start);
    bounds.add(r.end);
  }

  // Walk the string char-by-char, cutting at byte boundaries into segments,
  // and merge consecutive segments that share the same marks.
  type Seg = { text: string; marks: MarkSet };
  const segments: Seg[] = [];
  let buf = "";
  let bytePos = 0;
  const sortedBounds = [...bounds].sort((a, b) => a - b);
  let nextBound = sortedBounds.findIndex((b) => b > 0);

  const marksAt = (bytePos: number): MarkSet => {
    const m = emptyMarks();
    for (const r of ranges) {
      if (bytePos >= r.start && bytePos < r.end) {
        if (r.marks.bold) m.bold = true;
        if (r.marks.italic) m.italic = true;
        if (r.marks.code) m.code = true;
        if (r.marks.strike) m.strike = true;
        if (r.marks.link) m.link = r.marks.link;
      }
    }
    return m;
  };

  const flush = (segStartByte: number) => {
    if (!buf) return;
    const marks = marksAt(segStartByte);
    const last = segments[segments.length - 1];
    if (last && sameMarks(last.marks, marks)) last.text += buf;
    else segments.push({ text: buf, marks });
    buf = "";
  };

  let segStartByte = 0;
  for (const ch of plaintext) {
    const target = nextBound >= 0 ? sortedBounds[nextBound] : Infinity;
    if (bytePos >= target) {
      flush(segStartByte);
      segStartByte = bytePos;
      while (nextBound >= 0 && sortedBounds[nextBound] <= bytePos) nextBound++;
      if (nextBound >= sortedBounds.length) nextBound = -1;
    }
    buf += ch;
    bytePos += byteLength(ch);
  }
  flush(segStartByte);

  return segments.flatMap((seg) => emitSegment(seg.text, seg.marks));
}

const hasMark = (m: MarkSet) =>
  m.bold || m.italic || m.code || m.strike || !!m.link;

/**
 * Emit a text run as phrasing nodes. Flanking whitespace is peeled out of
 * emphasis-style marks (CommonMark forbids ` *x * `-style padding, and remark
 * would otherwise encode the space as `&#x20;`, breaking round-trips). Inline
 * code keeps its whitespace verbatim.
 */
function emitSegment(text: string, marks: MarkSet): PhrasingContent[] {
  if (!hasMark(marks)) return text ? [{ type: "text", value: text }] : [];
  if (marks.code) return [wrapMarks(text, marks)];
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
  if (!m) return [wrapMarks(text, marks)];
  const [, lead, core, trail] = m;
  if (!core) return [{ type: "text", value: text }]; // whitespace-only run
  const out: PhrasingContent[] = [];
  if (lead) out.push({ type: "text", value: lead });
  out.push(wrapMarks(core, marks));
  if (trail) out.push({ type: "text", value: trail });
  return out;
}

/** Wrap a text run in mark nodes (code innermost, link outermost). */
function wrapMarks(text: string, marks: MarkSet): PhrasingContent {
  let node: PhrasingContent;
  if (marks.code) {
    node = { type: "inlineCode", value: text } satisfies InlineCode;
  } else {
    node = { type: "text", value: text };
    if (marks.strike)
      node = { type: "delete", children: [node] } satisfies Delete;
    if (marks.italic)
      node = { type: "emphasis", children: [node] } satisfies Emphasis;
    if (marks.bold)
      node = { type: "strong", children: [node] } satisfies Strong;
  }
  if (marks.link)
    node = { type: "link", url: marks.link, children: [node] } satisfies Link;
  return node;
}

// ---- mdast phrasing → facets ----

/**
 * Flatten mdast phrasing content into a `plaintext` string plus facets, using
 * the given schema's feature `$type`s. Nested marks produce overlapping facets,
 * which all three formats accept.
 */
export function phrasingToFacets(
  nodes: PhrasingContent[],
  schema: FacetSchema,
): { plaintext: string; facets: Facet[] } {
  let plaintext = "";
  const facets: Facet[] = [];

  const pushFacet = (start: number, feature: FacetFeature) => {
    const byteEnd = byteLength(plaintext);
    if (byteEnd <= start) return;
    // Facet and byteSlice are plain refs — only feature objects carry $type
    // (matching how the leaflet/pckt/offprint editors write them).
    facets.push({
      index: { byteStart: start, byteEnd },
      features: [feature],
    });
  };

  const walk = (node: PhrasingContent) => {
    const start = byteLength(plaintext);
    switch (node.type) {
      case "text":
        plaintext += node.value;
        break;
      case "inlineCode":
        plaintext += node.value;
        pushFacet(start, { $type: schema.code });
        break;
      case "strong":
        node.children.forEach(walk);
        pushFacet(start, { $type: schema.bold });
        break;
      case "emphasis":
        node.children.forEach(walk);
        pushFacet(start, { $type: schema.italic });
        break;
      case "delete":
        node.children.forEach(walk);
        pushFacet(start, { $type: schema.strike });
        break;
      case "link":
        node.children.forEach(walk);
        pushFacet(start, { $type: schema.link, uri: node.url });
        break;
      case "break":
        plaintext += "\n";
        break;
      default:
        // image / footnote / html etc. inside a paragraph: keep any text we can.
        if ("children" in node && Array.isArray(node.children))
          (node.children as PhrasingContent[]).forEach(walk);
        else if ("value" in node && typeof node.value === "string")
          plaintext += node.value;
    }
  };

  nodes.forEach(walk);
  return { plaintext, facets };
}
