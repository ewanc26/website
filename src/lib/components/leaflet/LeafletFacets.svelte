<script lang="ts">
  /** Render Leaflet plaintext + UTF-8 byte-indexed facets as safe inline HTML. */

  import type { FacetSchema } from "$lib/providers/facets";
  import { safeLinkUrl } from "$lib/utils/url";

  export interface SerialisedFacet {
    $type?: string;
    index: { byteStart: number; byteEnd: number };
    features: { $type?: string; [k: string]: unknown }[];
  }

  let { plaintext, facets, schema, footnoteNumbers = {} }: {
    plaintext: string;
    facets?: SerialisedFacet[];
    schema: FacetSchema;
    footnoteNumbers?: Record<string, number>;
  } = $props();

  const NS = "pub.leaflet.richtext.facet";
  const encoder = new TextEncoder();

  function byteLength(s: string): number {
    return encoder.encode(s).length;
  }

  interface MarkSet {
    bold: boolean;
    italic: boolean;
    code: boolean;
    strike: boolean;
    underline: boolean;
    highlight: boolean;
    link?: string;
    id?: string;
    didMention?: string;
    atMention?: string;
    footnoteId?: string;
  }

  function emptyMarks(): MarkSet {
    return {
      bold: false,
      italic: false,
      code: false,
      strike: false,
      underline: false,
      highlight: false,
    };
  }

  function sameMarks(a: MarkSet, b: MarkSet): boolean {
    return (
      a.bold === b.bold &&
      a.italic === b.italic &&
      a.code === b.code &&
      a.strike === b.strike &&
      a.underline === b.underline &&
      a.highlight === b.highlight &&
      a.link === b.link &&
      a.id === b.id &&
      a.didMention === b.didMention &&
      a.atMention === b.atMention &&
      a.footnoteId === b.footnoteId
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
    for (const facet of facets) {
      const marks: Partial<MarkSet> = {};
      for (const feature of facet.features ?? []) {
        switch (feature.$type) {
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
            if (typeof feature.uri === "string") marks.link = feature.uri;
            break;
          case `${NS}#underline`:
            marks.underline = true;
            break;
          case `${NS}#highlight`:
            marks.highlight = true;
            break;
          case `${NS}#id`:
            if (typeof feature.id === "string") marks.id = feature.id;
            break;
          case `${NS}#didMention`:
            if (typeof feature.did === "string") marks.didMention = feature.did;
            break;
          case `${NS}#atMention`:
            if (typeof feature.atURI === "string") marks.atMention = feature.atURI;
            break;
          case `${NS}#footnote`:
            if (typeof feature.footnoteId === "string") {
              marks.footnoteId = feature.footnoteId;
            }
            break;
        }
      }
      if (Object.keys(marks).length > 0) {
        ranges.push({
          start: Math.max(0, facet.index.byteStart),
          end: Math.max(0, facet.index.byteEnd),
          marks,
        });
      }
    }

    const totalBytes = byteLength(plaintext);
    const bounds = new Set<number>([0, totalBytes]);
    for (const range of ranges) {
      bounds.add(Math.min(totalBytes, range.start));
      bounds.add(Math.min(totalBytes, range.end));
    }

    const segments: Seg[] = [];
    let buf = "";
    let bytePos = 0;
    const sortedBounds = [...bounds].sort((a, b) => a - b);
    let nextBound = sortedBounds.findIndex((bound) => bound > 0);

    const marksAt = (position: number): MarkSet => {
      const marks = emptyMarks();
      for (const range of ranges) {
        if (position >= range.start && position < range.end) {
          if (range.marks.bold) marks.bold = true;
          if (range.marks.italic) marks.italic = true;
          if (range.marks.code) marks.code = true;
          if (range.marks.strike) marks.strike = true;
          if (range.marks.underline) marks.underline = true;
          if (range.marks.highlight) marks.highlight = true;
          if (range.marks.link) marks.link = range.marks.link;
          if (range.marks.id) marks.id = range.marks.id;
          if (range.marks.didMention) marks.didMention = range.marks.didMention;
          if (range.marks.atMention) marks.atMention = range.marks.atMention;
          if (range.marks.footnoteId) marks.footnoteId = range.marks.footnoteId;
        }
      }
      return marks;
    };

    const flush = (segmentStartByte: number) => {
      if (!buf) return;
      const marks = marksAt(segmentStartByte);
      const previous = segments[segments.length - 1];
      if (previous && sameMarks(previous.marks, marks)) previous.text += buf;
      else segments.push({ text: buf, marks });
      buf = "";
    };

    let segmentStartByte = 0;
    for (const char of plaintext) {
      const target = nextBound >= 0 ? sortedBounds[nextBound] : Infinity;
      if (bytePos >= target) {
        flush(segmentStartByte);
        segmentStartByte = bytePos;
        while (nextBound >= 0 && sortedBounds[nextBound] <= bytePos) nextBound++;
        if (nextBound >= sortedBounds.length) nextBound = -1;
      }
      buf += char;
      bytePos += byteLength(char);
    }
    flush(segmentStartByte);
    return segments;
  }

  function esc(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeId(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const id = value.trim().replace(/[^A-Za-z0-9_:.-]/g, "-");
    return id || undefined;
  }

  function mentionHref(marks: MarkSet): string | undefined {
    if (marks.didMention && /^did:[a-z0-9]+:[A-Za-z0-9._:%-]+$/i.test(marks.didMention)) {
      return `https://bsky.app/profile/${marks.didMention}`;
    }

    if (marks.atMention?.startsWith("at://")) {
      const parts = marks.atMention.slice(5).split("/");
      if (parts.length >= 3 && parts[1] === "app.bsky.feed.post") {
        return `https://bsky.app/profile/${parts[0]}/post/${parts[2]}`;
      }
      // Leaflet maintains this redirect route specifically for document and
      // publication AT-URI mentions, including Standard.site aliases.
      return `https://leaflet.pub/lish/uri/${encodeURIComponent(marks.atMention)}`;
    }

    return undefined;
  }

  function renderSeg(segment: Seg): string {
    const footnoteNumber = segment.marks.footnoteId
      ? footnoteNumbers[segment.marks.footnoteId]
      : undefined;

    if (segment.marks.footnoteId && footnoteNumber) {
      const id = safeId(segment.marks.footnoteId) ?? String(footnoteNumber);
      return `<sup class="leaflet-footnote-ref" id="fnref-${esc(id)}"><a href="#fn-${esc(id)}" aria-label="Footnote ${footnoteNumber}">${footnoteNumber}</a></sup>`;
    }

    let inner = esc(segment.text);
    if (segment.marks.code) {
      inner = `<code>${inner}</code>`;
    } else {
      if (segment.marks.strike) inner = `<del>${inner}</del>`;
      if (segment.marks.underline) inner = `<u>${inner}</u>`;
      if (segment.marks.highlight) inner = `<mark>${inner}</mark>`;
      if (segment.marks.italic) inner = `<em>${inner}</em>`;
      if (segment.marks.bold) inner = `<strong>${inner}</strong>`;
    }

    const href = safeLinkUrl(segment.marks.link) ?? mentionHref(segment.marks);
    if (href) {
      inner = `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
    }

    const id = safeId(segment.marks.id);
    if (id) inner = `<span id="${esc(id)}">${inner}</span>`;
    return inner;
  }

  let html = $derived(computeSegments().map(renderSeg).join(""));
</script>

{@html html}

<style>
  :global(.leaflet-footnote-ref) {
    margin-inline: 0.08em;
    font-size: 0.72em;
    line-height: 0;
    vertical-align: super;
  }

  :global(.leaflet-footnote-ref a) {
    text-decoration: none;
  }
</style>
