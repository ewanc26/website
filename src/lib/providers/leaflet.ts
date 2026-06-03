import {
  facetsToPhrasing,
  phrasingToFacets,
  type Facet,
  type FacetSchema,
} from "./facets";
import {
  imageBlobSrc,
  mdastToMarkdown,
  parseMarkdown,
  resolveMarkdownImage,
} from "./mdast";
import type { ContentProvider, ReadCtx, WriteCtx } from "./types";
import type {
  List,
  ListItem as MdListItem,
  PhrasingContent,
  RootContent,
} from "mdast";

const NS = "pub.leaflet.richtext.facet";
const SCHEMA: FacetSchema = {
  facet: NS,
  byteSlice: `${NS}#byteSlice`,
  bold: `${NS}#bold`,
  italic: `${NS}#italic`,
  code: `${NS}#code`,
  strike: `${NS}#strikethrough`,
  link: `${NS}#link`,
  lossy: {
    [`${NS}#highlight`]: "highlight",
    [`${NS}#underline`]: "underline",
    [`${NS}#atMention`]: "mentions",
    [`${NS}#didMention`]: "mentions",
    [`${NS}#footnote`]: "footnotes",
  },
};

const B = (n: string) => `pub.leaflet.blocks.${n}`;
const CONTENT = "pub.leaflet.content";
const LINEAR = "pub.leaflet.pages.linearDocument";

const LOSS_LABELS: Record<string, string> = {
  [B("iframe")]: "embeds",
  [B("website")]: "website cards",
  [B("bskyPost")]: "Bluesky posts",
  [B("standardSitePost")]: "linked posts",
  [B("page")]: "sub-pages",
  [B("poll")]: "polls",
  [B("button")]: "buttons",
  [B("postsList")]: "post lists",
  [B("signup")]: "signup forms",
};

type Obj = Record<string, unknown>;
const facetsOf = (o: Obj) => o.facets as Facet[] | undefined;

// ---- read: leaflet content → markdown ----

function blockToMdast(
  inner: Obj,
  alignment: string | undefined,
  lost: Set<string>,
): RootContent[] {
  if (alignment && !alignment.endsWith("textAlignLeft"))
    lost.add("text alignment");
  const text = (o: Obj) =>
    facetsToPhrasing((o.plaintext as string) ?? "", facetsOf(o), SCHEMA, lost);

  switch (inner.$type) {
    case B("text"): {
      const children = text(inner);
      return children.length ? [{ type: "paragraph", children }] : [];
    }
    case B("header"): {
      const level = Math.min(Math.max((inner.level as number) ?? 1, 1), 6) as 1;
      return [{ type: "heading", depth: level, children: text(inner) }];
    }
    case B("blockquote"):
      return [
        {
          type: "blockquote",
          children: [{ type: "paragraph", children: text(inner) }],
        },
      ];
    case B("code"):
      return [
        {
          type: "code",
          lang: (inner.language as string) || null,
          value: (inner.plaintext as string) ?? "",
        },
      ];
    case B("math"):
      return [
        { type: "code", lang: "math", value: (inner.tex as string) ?? "" },
      ];
    case B("horizontalRule"):
      return [{ type: "thematicBreak" }];
    case B("image"): {
      const url = imageBlobSrc(inner.image as never);
      return url
        ? [
            {
              type: "paragraph",
              children: [
                { type: "image", url, alt: (inner.alt as string) ?? "" },
              ],
            },
          ]
        : [];
    }
    case B("unorderedList"):
      return [listToMdast(inner, false, lost)];
    case B("orderedList"):
      return [listToMdast(inner, true, lost)];
    default:
      if (inner.$type && LOSS_LABELS[inner.$type as string])
        lost.add(LOSS_LABELS[inner.$type as string]);
      else lost.add("an unsupported block");
      return [];
  }
}

function listToMdast(list: Obj, ordered: boolean, lost: Set<string>): List {
  const items = (list.children as Obj[]) ?? [];
  return {
    type: "list",
    ordered,
    start: ordered ? ((list.startIndex as number) ?? undefined) : undefined,
    children: items.map((it) => listItemToMdast(it, lost)),
  };
}

function listItemToMdast(item: Obj, lost: Set<string>): MdListItem {
  const content = item.content as Obj | undefined;
  const children: RootContent[] = [];
  if (content) {
    if (content.$type === B("image")) {
      const url = imageBlobSrc(content.image as never);
      if (url)
        children.push({
          type: "paragraph",
          children: [
            { type: "image", url, alt: (content.alt as string) ?? "" },
          ],
        });
    } else {
      children.push({
        type: "paragraph",
        children: facetsToPhrasing(
          (content.plaintext as string) ?? "",
          facetsOf(content),
          SCHEMA,
          lost,
        ),
      });
    }
  }
  if (Array.isArray(item.children) && item.children.length)
    children.push(listToMdast({ children: item.children }, false, lost));
  else if (item.orderedListChildren)
    children.push(listToMdast(item.orderedListChildren as Obj, true, lost));
  const li: MdListItem = { type: "listItem", children: children as never };
  if (typeof item.checked === "boolean") li.checked = item.checked;
  return li;
}

// ---- write: markdown → leaflet content ----

function mdastToBlock(node: RootContent, ctx: WriteCtx): Obj | null {
  switch (node.type) {
    case "heading": {
      const { plaintext, facets } = phrasingToFacets(node.children, SCHEMA);
      return tidy({ $type: B("header"), level: node.depth, plaintext, facets });
    }
    case "paragraph": {
      if (node.children.length === 1 && node.children[0].type === "image")
        return imageBlock(node.children[0], ctx);
      const { plaintext, facets } = phrasingToFacets(node.children, SCHEMA);
      return tidy({ $type: B("text"), plaintext, facets });
    }
    case "blockquote": {
      const phrasing: PhrasingContent[] = [];
      for (const child of node.children) {
        if (child.type === "paragraph") {
          if (phrasing.length) phrasing.push({ type: "break" });
          phrasing.push(...child.children);
        }
      }
      const { plaintext, facets } = phrasingToFacets(phrasing, SCHEMA);
      return tidy({ $type: B("blockquote"), plaintext, facets });
    }
    case "code":
      if (node.lang === "math") return { $type: B("math"), tex: node.value };
      return tidy({
        $type: B("code"),
        language: node.lang || undefined,
        plaintext: node.value,
      });
    case "thematicBreak":
      return { $type: B("horizontalRule") };
    case "image":
      return imageBlock(node, ctx);
    case "list":
      return listBlock(node, ctx);
    default:
      return null; // tables, html, etc. — dropped
  }
}

function imageBlock(node: RootContent, ctx: WriteCtx): Obj | null {
  if (node.type !== "image") return null;
  const img = resolveMarkdownImage(node, ctx);
  // Leaflet images must be PDS blobs; an external URL can't be stored.
  if (!img || img.kind !== "blob") return null;
  return {
    $type: B("image"),
    image: img.ref,
    alt: img.alt || undefined,
    aspectRatio: {
      width: img.width && img.width > 0 ? img.width : 1,
      height: img.height && img.height > 0 ? img.height : 1,
    },
  };
}

function listBlock(node: List, ctx: WriteCtx): Obj {
  return tidy({
    $type: B(node.ordered ? "orderedList" : "unorderedList"),
    startIndex: node.ordered ? (node.start ?? undefined) : undefined,
    children: node.children.map((li) => listItemBlock(li, node.ordered, ctx)),
  });
}

function listItemBlock(
  item: MdListItem,
  ordered: boolean | null | undefined,
  ctx: WriteCtx,
): Obj {
  const out: Obj = {
    $type: B(`${ordered ? "ordered" : "unordered"}List#listItem`),
  };
  let nested: List | null = null;
  let content: Obj | null = null;
  for (const child of item.children) {
    if (child.type === "list") nested = child;
    else if (child.type === "paragraph") {
      if (child.children.length === 1 && child.children[0].type === "image") {
        const ib = imageBlock(child.children[0], ctx);
        if (ib) content = ib;
      } else {
        const { plaintext, facets } = phrasingToFacets(child.children, SCHEMA);
        content = tidy({ $type: B("text"), plaintext, facets });
      }
    }
  }
  out.content = content ?? { $type: B("text"), plaintext: "" };
  if (typeof item.checked === "boolean") out.checked = item.checked;
  if (nested) {
    if (nested.ordered) out.orderedListChildren = listBlock(nested, ctx);
    else
      out.children = nested.children.map((li) => listItemBlock(li, false, ctx));
  }
  return out;
}

/** Drop undefined fields and empty facet arrays so records stay clean. */
function tidy(o: Obj): Obj {
  for (const k of Object.keys(o)) {
    if (o[k] === undefined) delete o[k];
    if (
      k === "facets" &&
      Array.isArray(o[k]) &&
      (o[k] as unknown[]).length === 0
    )
      delete o[k];
  }
  return o;
}

export const leafletProvider: ContentProvider = {
  id: "leaflet",
  label: "Leaflet",
  contentType: CONTENT,
  supportsImages: true,
  matches: (c) => (c as Obj | null)?.$type === CONTENT,

  async toMarkdown(content: unknown, ctx: ReadCtx) {
    const c = content as Obj;
    const lost = new Set<string>();
    let pages = (c.pages as Obj[]) ?? [];
    if (c.blobPages) {
      try {
        const bytes = await ctx.fetchBlob(c.blobPages as never);
        pages = JSON.parse(new TextDecoder().decode(bytes)) as Obj[];
      } catch {
        /* fall back to inline pages */
      }
    }
    const page = pages.find((p) => p.$type === LINEAR) ?? pages[0];
    const blocks = (page?.blocks as Obj[]) ?? [];
    const out: RootContent[] = [];
    for (const b of blocks) {
      const inner = b.block as Obj;
      if (!inner) continue;
      out.push(...blockToMdast(inner, b.alignment as string | undefined, lost));
    }
    return { markdown: mdastToMarkdown(out), lost: [...lost] };
  },

  fromMarkdown(markdown: string, ctx: WriteCtx) {
    const tree = parseMarkdown(markdown);
    const blocks: Obj[] = [];
    for (const node of tree.children) {
      const block = mdastToBlock(node, ctx);
      if (block) blocks.push({ block });
    }
    return {
      $type: CONTENT,
      pages: [{ $type: LINEAR, blocks }],
    };
  },
};
