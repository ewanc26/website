<script lang="ts">
  /**
   * Render Leaflet plaintext + facets as inline HTML.
   * Handles bold, italic, code, strikethrough, and links.
   * Lossy features (highlight, underline, mentions, footnotes) are
   * preserved as plain text.
   */

  import type { FacetSchema } from "$lib/providers/facets";

  /** Loosely-typed facet shape from serialised block data. */
  interface SerialisedFacet {
    $type?: string;
    index: { byteStart: number; byteEnd: number };
    features: { $type?: string; [k: string]: unknown }[];
  }

  let { plaintext, facets, schema }: {
    plaintext: string;
    facets?: SerialisedFacet[];
    schema: FacetSchema;
  } = $props();

  const encoder = new TextEncoder();
  function byteLength(s: string): number {
    return encoder.encode(s).length;
  }

  interface MarkSet {
    bold: boolean;
    italic: boolean;
    code: boolean;
    strike: boolean;
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

  interface Seg {
    text: string;
    marks: MarkSet;
  }

  function computeSegments(): Seg[] {
    if (!plaintext) return [];
    if (!facets || facets.length === 0) {
      return [{ text: plaintext, marks: emptyMarks() }];
    }

    const ranges: { start: number; end: number; marks: Partial<MarkSet> }[] = [];
    for (const f of facets) {
      const marks: Partial<MarkSet> = {};
      for (const feat of f.features ?? []) {
        switch (feat.$type) {
          case schema.bold: marks.bold = true; break;
          case schema.italic: marks.italic = true; break;
          case schema.code: marks.code = true; break;
          case schema.strike: marks.strike = true; break;
          case schema.link:
            if (typeof feat.uri === "string") marks.link = feat.uri;
            break;
        }
      }
      if (Object.keys(marks).length > 0)
        ranges.push({ start: f.index.byteStart, end: f.index.byteEnd, marks });
    }

    const bounds = new Set<number>([0, byteLength(plaintext)]);
    for (const r of ranges) {
      bounds.add(r.start);
      bounds.add(r.end);
    }

    const segments: Seg[] = [];
    let buf = "";
    let bytePos = 0;
    const sortedBounds = [...bounds].sort((a, b) => a - b);
    let nextBound = sortedBounds.findIndex((b) => b > 0);

    const marksAt = (bp: number): MarkSet => {
      const m = emptyMarks();
      for (const r of ranges) {
        if (bp >= r.start && bp < r.end) {
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
    return segments;
  }

  /** Escape HTML special characters. */
  function esc(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Render a segment to HTML string. */
  function renderSeg(seg: Seg): string {
    const t = esc(seg.text);
    if (!seg.marks.bold && !seg.marks.italic && !seg.marks.code && !seg.marks.strike && !seg.marks.link) {
      return t;
    }

    let inner = t;
    if (seg.marks.code) {
      inner = `<code>${t}</code>`;
    } else {
      if (seg.marks.strike) inner = `<del>${inner}</del>`;
      if (seg.marks.italic) inner = `<em>${inner}</em>`;
      if (seg.marks.bold) inner = `<strong>${inner}</strong>`;
    }
    if (seg.marks.link) {
      inner = `<a href="${esc(seg.marks.link)}" target="_blank" rel="noopener">${inner}</a>`;
    }
    return inner;
  }

  let html = $derived(computeSegments().map(renderSeg).join(""));
</script>

{@html html}
