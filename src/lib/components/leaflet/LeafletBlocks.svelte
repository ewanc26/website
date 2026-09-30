<script lang="ts">
  /**
   * Native Leaflet reader for published blog content.
   *
   * The server serialises BlobRefs to safe PDS URLs, keeps every page and
   * hydrates public record references so the reader can represent the current
   * Leaflet publishing surface without flattening the document to Markdown.
   */
  import LeafletFacets from "./LeafletFacets.svelte";
  import LeafletImage from "./LeafletImage.svelte";
  import LeafletImageGallery from "./LeafletImageGallery.svelte";
  import LeafletListItem from "./LeafletListItem.svelte";
  import LeafletCode from "./LeafletCode.svelte";
  import LeafletMath from "./LeafletMath.svelte";
  import LeafletEmbed from "./LeafletEmbed.svelte";
  import LeafletWebsiteCard from "./LeafletWebsiteCard.svelte";
  import LeafletButton from "./LeafletButton.svelte";
  import LeafletBskyPost from "./LeafletBskyPost.svelte";
  import LeafletDrawing from "./LeafletDrawing.svelte";
  import LeafletBlocks from "./LeafletBlocks.svelte";
  import Pentacle from "$lib/components/icons/Pentacle.svelte";
  import Triskele from "$lib/components/icons/Triskele.svelte";

  import type { SerialisedBlock, SerialisedPage } from "$lib/providers/serialise";
  import type { SerialisedFacet } from "$lib/utils/leafletFacets";
  import { safeLinkUrl } from "$lib/utils/url";
  import { canvasBlockOrder, fixedMetrics, isPositioned, measure, stackOrders, styleFor } from "$lib/utils/leafletCanvas";
  import {
    B,
    CANVAS,
    LINEAR,
    MAX_PAGE_DEPTH,
    SCHEMA,
    alignmentClass,
    getAspectRatio,
    getFacets,
    getPlaintext,
    textSizeClass,
    type Obj,
  } from "$lib/utils/leafletReader";

  const NS = "pub.leaflet.richtext.facet";

  interface ReaderPost {
    uri: string;
    title: string;
    description?: string;
    createdAt?: string;
    tags?: string[];
    url: string;
  }

  interface ReaderPublication {
    uri?: string;
    title: string;
    description?: string;
    url?: string;
  }

  interface ReaderReference {
    uri: string;
    cid?: string;
    value: Obj;
  }

  interface ReaderHeader {
    title: string;
    description?: string;
    publishedAt?: string;
    tags?: string[];
  }

  interface Footnote {
    id: string;
    index: number;
    contentPlaintext: string;
    contentFacets?: SerialisedFacet[];
  }

  interface Props {
    blocks: SerialisedBlock[];
    pages?: SerialisedPage[];
    pageType?: string;
    sourceUrl?: string;
    posts?: ReaderPost[];
    publication?: ReaderPublication | null;
    references?: Record<string, ReaderReference>;
    /** The document's own metadata, for `postHeader` blocks. */
    header?: ReaderHeader;
    /** Publications this publication recommends, for `recommendedPubs` blocks. */
    recommendedPublications?: ReaderReference[];
    /** Internal: recursion depth and pre-computed footnote numbers for embedded pages. */
    depth?: number;
    footnoteNumbers?: Record<string, number>;
    /** Internal: fixed bounds for an embedded canvas page. */
    canvasSize?: { width?: number; height?: number };
    /** Internal: true while rendering blocks placed on a canvas page. */
    inCanvas?: boolean;
  }

  let {
    blocks,
    pages = [],
    pageType,
    sourceUrl,
    posts = [],
    publication,
    references = {},
    header,
    recommendedPublications = [],
    depth = 0,
    footnoteNumbers: inheritedFootnoteNumbers,
    canvasSize,
    inCanvas = false,
  }: Props = $props();

  function visibleBlocks(items: SerialisedBlock[]): SerialisedBlock[] {
    const gate = items.findIndex((wrapper) => wrapper.block?.$type === B("membersOnlyDelimiter"));
    return gate === -1 ? items : items.slice(0, gate + 1);
  }
  function pageForId(id: unknown): SerialisedPage | undefined {
    return typeof id === "string" ? pages.find((page) => page.id === id) : undefined;
  }
  function sourceHref(): string | undefined {
    return safeLinkUrl(sourceUrl) ?? safeLinkUrl(publication?.url);
  }
  function referenceValue(uri: unknown): Obj | undefined {
    return typeof uri === "string" ? references[uri]?.value : undefined;
  }
  function atReferenceHref(uri: unknown): string | undefined {
    if (typeof uri !== "string" || !uri.startsWith("at://")) return undefined;
    const local = posts.find((post) => post.uri === uri);
    if (local) return safeLinkUrl(local.url);
    return `https://leaflet.pub/lish/uri/${encodeURIComponent(uri)}`;
  }
  function publicationReferenceHref(uri: unknown): string | undefined {
    if (typeof uri === "string" && publication?.uri === uri) {
      return safeLinkUrl(publication.url);
    }

    const remote = referenceValue(uri);
    const remoteUrl = safeLinkUrl(remote?.url as string | undefined);
    if (remoteUrl) return remoteUrl;
    return atReferenceHref(uri);
  }
  function postsForBlock(inner: Obj): ReaderPost[] {
    // Current Leaflet uses one tag; retain support for the older array form
    // because published records are immutable and both exist in the wild.
    const currentTags = typeof inner.filterByTag === "string"
      ? [inner.filterByTag]
      : Array.isArray(inner.filterByTags)
        ? inner.filterByTags.filter((tag): tag is string => typeof tag === "string")
        : [];

    let filtered = currentTags.length
      ? posts.filter((post) => currentTags.every((tag) => post.tags?.includes(tag)))
      : posts;

    const limit = typeof inner.limit === "number" && Number.isFinite(inner.limit) ? Math.max(0, Math.floor(inner.limit)) : undefined;
    if (limit && limit > 0) filtered = filtered.slice(0, limit);
    return filtered;
  }
  function postsListView(view: unknown): "small" | "medium" | "chapter" {
    // Current Leaflet: small | medium | chapter, unknown values read as medium.
    // Older published records used compact | full.
    if (view === "small" || view === "compact") return "small";
    if (view === "chapter") return "chapter";
    return "medium";
  }
  function firstTextBlock(page: SerialisedPage | undefined): string | undefined {
    const wrappers = page?.$type === CANVAS ? [...(page?.blocks ?? [])].sort(canvasBlockOrder) : (page?.blocks ?? []);
    for (const wrapper of wrappers) {
      const inner = wrapper.block;
      if (!inner) continue;
      if (inner.$type === LINEAR) {
        const nested = firstTextBlock({ blocks: (inner.blocks as SerialisedBlock[]) ?? [] } as SerialisedPage);
        if (nested) return nested;
        continue;
      }
      if ((inner.$type === B("header") || inner.$type === B("text")) && getPlaintext(inner).trim()) {
        return getPlaintext(inner).trim();
      }
    }
    return undefined;
  }
  function headingId(text: string, index: number): string {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return `${base || "leaflet-heading"}-${index}`;
  }
  function safeAnchor(value: string): string {
    const cleaned = value.trim().replace(/[^A-Za-z0-9_:.-]/g, "-");
    return cleaned || "footnote";
  }
  function collectFootnotes(): Footnote[] {
    const found: Footnote[] = [];
    const seen = new Set<string>();
    const visitedPages = new Set<string>();

    const scanFacets = (facets: SerialisedFacet[] | undefined) => {
      for (const facet of facets ?? []) {
        for (const feature of facet.features ?? []) {
          if (feature.$type !== `${NS}#footnote`) continue;
          const id = typeof feature.footnoteId === "string" ? feature.footnoteId : undefined;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          found.push({
            id,
            index: found.length + 1,
            contentPlaintext: typeof feature.contentPlaintext === "string" ? feature.contentPlaintext : "",
            contentFacets: Array.isArray(feature.contentFacets) ? (feature.contentFacets as SerialisedFacet[]) : undefined,
          });
        }
      }
    };

    const scanListItems = (items: Obj[], ordered: boolean) => {
      for (const item of items) {
        if (item.content && typeof item.content === "object") {
          scanBlock(item.content as Obj);
        }
        if (Array.isArray(item.children)) {
          scanListItems(item.children as Obj[], ordered);
        } else if (ordered && item.unorderedListChildren) {
          const child = item.unorderedListChildren as Obj;
          scanListItems((child.children as Obj[]) ?? [], false);
        } else if (!ordered && item.orderedListChildren) {
          const child = item.orderedListChildren as Obj;
          scanListItems((child.children as Obj[]) ?? [], true);
        }
      }
    };

    const scanBlock = (inner: Obj) => {
      const type = inner.$type;
      if (type === B("text") || type === B("header") || type === B("blockquote")) {
        scanFacets(getFacets(inner));
      } else if (type === B("unorderedList")) {
        scanListItems((inner.children as Obj[]) ?? [], false);
      } else if (type === B("orderedList")) {
        scanListItems((inner.children as Obj[]) ?? [], true);
      } else if (type === LINEAR) {
        scanBlocks((inner.blocks as SerialisedBlock[]) ?? []);
      } else if ((type === B("page") || type === B("embeddedCanvas")) && typeof inner.id === "string") {
        if (visitedPages.has(inner.id)) return;
        visitedPages.add(inner.id);
        const page = pageForId(inner.id);
        if (page) scanBlocks(page.blocks);
      }
    };

    const scanBlocks = (items: SerialisedBlock[]) => {
      for (const wrapper of visibleBlocks(items)) if (wrapper?.block) scanBlock(wrapper.block);
    };

    scanBlocks(blocks);
    return found;
  }

  const isRoot = $derived(inheritedFootnoteNumbers === undefined);
  const footnotes = $derived(isRoot ? collectFootnotes() : []);
  const footnoteNumbers: Record<string, number> = $derived(
    inheritedFootnoteNumbers ?? Object.fromEntries(footnotes.map((f) => [f.id, f.index])),
  );

  const shared = $derived({ pages, sourceUrl, posts, publication, references, header, recommendedPublications, footnoteNumbers });
  const source = $derived(sourceHref());
  const items = $derived(visibleBlocks(blocks));
  // Canvas blocks carry no document order; Leaflet reads them top-to-bottom,
  // left-to-right and stacks them by their fractional stackOrder.
  const canvasItems = $derived(pageType === CANVAS ? [...items].sort(canvasBlockOrder) : []);
  const positioned = $derived(canvasItems.filter(isPositioned));
  const unpositioned = $derived(canvasItems.filter((b) => !isPositioned(b)));
  const fixed = $derived(fixedMetrics(canvasSize?.width, canvasSize?.height));
  const metrics = $derived(fixed ?? measure(canvasItems));
  const zIndexes = $derived(stackOrders(positioned));
  const asFacets = (i: Obj) => ({ plaintext: getPlaintext(i), facets: getFacets(i), schema: SCHEMA, footnoteNumbers });
</script>

{#if pageType === CANVAS}
  {#if positioned.length > 0}
    <div class="leaflet-canvas" class:leaflet-canvas--fixed={!!fixed} style={`aspect-ratio:${metrics.width}/${metrics.height}`} aria-label="Leaflet canvas">
      {#each positioned as block, index (index)}
        <div class="leaflet-canvas-block" style={styleFor(block, metrics, zIndexes[index])}>
          <LeafletBlocks blocks={[block]} {...shared} depth={depth + 1} inCanvas={true} />
        </div>
      {/each}
    </div>
  {/if}
  {#if unpositioned.length > 0}
    <div class="leaflet-canvas-unpositioned" aria-label="Unpositioned canvas content">
      {#each unpositioned as block, index (index)}
        <LeafletBlocks blocks={[block]} {...shared} depth={depth + 1} inCanvas={true} />
      {/each}
    </div>
  {/if}
{:else}
  {#each items as wrapper, i (i)}
    {@const inner = wrapper.block}
    {@const align = alignmentClass(wrapper.alignment)}
    {@const type = inner.$type as string}
    {@const level = Math.min(Math.max((inner.level as number) ?? 1, 1), 6)}
    {@const H = level <= 2 ? "h2" : `h${level}`}
    {@const ratio = getAspectRatio(inner)}
    {@const pollRef = inner.pollRef as { uri?: string } | undefined}

    {#if type === B("text")}
      <p class={`leaflet-text ${textSizeClass(inner.textSize)}${align ? ` ${align}` : ""}`}><LeafletFacets {...asFacets(inner)} /></p>
    {:else if type === B("header")}
      <svelte:element this={H} id={headingId(getPlaintext(inner), i)} class={`leaflet-h${level} ${align}`}>
        <LeafletFacets {...asFacets(inner)} />
      </svelte:element>
    {:else if type === B("blockquote")}
      <blockquote class={`leaflet-blockquote${align ? ` ${align}` : ""}`}><LeafletFacets {...asFacets(inner)} /></blockquote>
    {:else if type === B("code")}
      <LeafletCode plaintext={(inner.plaintext as string) ?? ""} language={inner.language as string | undefined} />
    {:else if type === B("math")}
      <LeafletMath tex={(inner.tex as string) ?? ""} />
    {:else if type === B("horizontalRule")}
      <div class="leaflet-hr-wrap">
        <hr class="leaflet-hr" />
        <div class="leaflet-hr-symbol">
          {#if i % 2 === 0}<Pentacle size={12} />{:else}<Triskele size={12} />{/if}
        </div>
      </div>
    {:else if type === B("image")}
      <LeafletImage
        src={(inner._imageSrc as string) ?? ""}
        alt={inner.alt as string | undefined}
        width={ratio?.width}
        height={ratio?.height}
        fullBleed={inner.fullBleed as boolean | undefined}
        displayWidth={inner.width as number | undefined}
      />
    {:else if type === B("imageGallery")}
      <LeafletImageGallery
        images={(inner.images as Obj[]) ?? []}
        format={inner.format as string | undefined}
        gap={inner.gap as number | undefined}
        maxWidth={inner.maxWidth as number | undefined}
      />
    {:else if type === B("unorderedList")}
      <ul class={`leaflet-list${align ? ` ${align}` : ""}`}>
        {#each (inner.children as Obj[]) ?? [] as item, itemIndex (itemIndex)}
          <LeafletListItem {item} ordered={false} depth={0} {footnoteNumbers} />
        {/each}
      </ul>
    {:else if type === B("orderedList")}
      <ol class={`leaflet-list ordered${align ? ` ${align}` : ""}`} start={inner.startIndex as number | undefined}>
        {#each (inner.children as Obj[]) ?? [] as item, itemIndex (itemIndex)}
          <LeafletListItem {item} ordered={true} depth={0} {footnoteNumbers} />
        {/each}
      </ol>
    {:else if type === B("html") || (type === B("iframe") && typeof inner.html === "string" && inner.html)}
      {@const html = typeof inner.html === "string" ? inner.html : typeof inner.content === "string" ? inner.content : ""}
      {@const htmlHeight = typeof inner.height === "number" && Number.isFinite(inner.height) ? Math.min(Math.max(inner.height, 16), 1600) : undefined}
      {@const htmlStyle = ratio ? `aspect-ratio:${ratio.width}/${ratio.height};min-height:0` : htmlHeight ? `height:${htmlHeight}px;min-height:0` : undefined}
      {#if html}
        <iframe class="leaflet-html" title="Embedded Leaflet HTML" srcdoc={html} sandbox="" loading="lazy" referrerpolicy="no-referrer" style={htmlStyle}></iframe>
      {:else}
        <div class="leaflet-reader-fallback">HTML block has no readable content.</div>
      {/if}
    {:else if type === B("iframe")}
      <LeafletEmbed url={(inner.url as string) ?? ""} height={inner.height as number | undefined} aspectRatio={ratio} />
    {:else if type === B("website")}
      <LeafletWebsiteCard
        src={(inner.src as string) ?? ""}
        title={inner.title as string | undefined}
        description={inner.description as string | undefined}
        previewImageSrc={inner._previewImageSrc as string | undefined}
      />
    {:else if type === B("button")}
      <LeafletButton text={(inner.text as string) ?? ""} url={(inner.url as string) ?? ""} />
    {:else if type === B("bskyPost")}
      {@const postRef = inner.postRef as { uri: string; cid: string }}
      <LeafletBskyPost {postRef} clientHost={inner.clientHost as string | undefined} record={references[postRef?.uri]} />
    {:else if type === B("leafletQuote")}
      {@const quoteUri = typeof inner.src === "string" ? inner.src : typeof (inner.record as Obj | undefined)?.uri === "string" ? ((inner.record as Obj).uri as string) : undefined}
      {@const quote = referenceValue(quoteUri)}
      {@const quoteHref = quoteUri ? atReferenceHref(quoteUri) : undefined}
      <figure class="leaflet-bsky-post">
        {#if typeof quote?.title === "string"}<strong>{quote.title}</strong>{/if}
        {#if typeof quote?.description === "string"}<blockquote>{quote.description}</blockquote>{/if}
        {#if quoteHref}<figcaption><a href={quoteHref}>View quoted Leaflet post →</a></figcaption>{/if}
      </figure>
    {:else if type === B("standardSitePost")}
      {@const href = atReferenceHref(inner.uri)}
      {@const localPost = typeof inner.uri === "string" ? posts.find((post) => post.uri === inner.uri) : undefined}
      {@const remotePost = referenceValue(inner.uri)}
      {@const remoteTitle = typeof remotePost?.title === "string" ? remotePost.title : undefined}
      {@const remoteDescription = typeof remotePost?.description === "string" ? remotePost.description : undefined}
      {@const description = localPost?.description ?? remoteDescription}
      <article class="leaflet-reference-card" data-size={(inner.size as string) ?? "medium"}>
        {#if href}
          <a {href} class="leaflet-reference-link">
            <strong>{localPost?.title ?? remoteTitle ?? "Referenced post"}</strong>
            {#if description}<span>{description}</span>{/if}
          </a>
        {:else}
          <em>Post not found.</em>
        {/if}
      </article>
    {:else if type === B("standardSitePublication")}
      {@const href = publicationReferenceHref(inner.uri)}
      {@const remotePublication = referenceValue(inner.uri)}
      {@const isLocal = publication?.uri === inner.uri}
      {@const pubTitle = isLocal ? publication?.title : typeof remotePublication?.name === "string" ? remotePublication.name : "Referenced publication"}
      {@const pubDescription = isLocal ? publication?.description : typeof remotePublication?.description === "string" ? remotePublication.description : undefined}
      <article class="leaflet-reference-card leaflet-publication-card">
        {#if href}
          <a {href} class="leaflet-reference-link">
            <strong>{pubTitle}</strong>
            {#if pubDescription}<span>{pubDescription}</span>{/if}
          </a>
        {:else}
          <em>Publication not found.</em>
        {/if}
      </article>
    {:else if type === B("postsList")}
      {@const listed = postsForBlock(inner)}
      {@const view = postsListView(inner.view)}
      <section class="leaflet-posts-list" data-view={view} aria-label="Publication posts">
        {#if listed.length}
          {#each listed as post, postIndex (post.uri)}
            <article class:highlighted={inner.highlightFirstPost === true && postIndex === 0}>
              <a href={safeLinkUrl(post.url)}>
                <strong>{post.title}</strong>
                {#if view !== "small" && post.description}<span>{post.description}</span>{/if}
                {#if post.createdAt}<time datetime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString("en-gb")}</time>{/if}
              </a>
            </article>
          {/each}
        {:else}
          <p class="leaflet-reader-fallback">No matching publication posts.</p>
        {/if}
      </section>
    {:else if type === B("page")}
      {@const embedded = pageForId(inner.id)}
      {#if !embedded || depth >= MAX_PAGE_DEPTH}
        <div class="leaflet-reader-fallback">Embedded page unavailable.</div>
      {:else if inner.display === "compact"}
        <details class="leaflet-embedded-page leaflet-embedded-page--compact">
          <summary>{firstTextBlock(embedded) ?? "Open page"}</summary>
          <LeafletBlocks blocks={embedded.blocks} pageType={embedded.$type} {...shared} depth={depth + 1} />
        </details>
      {:else}
        <section class="leaflet-embedded-page" aria-label="Embedded Leaflet page">
          <LeafletBlocks blocks={embedded.blocks} pageType={embedded.$type} {...shared} depth={depth + 1} />
        </section>
      {/if}
    {:else if type === B("embeddedCanvas")}
      {@const embedded = pageForId(inner.id)}
      {#if !embedded || embedded.$type !== CANVAS || !fixedMetrics(embedded.width, embedded.height) || depth >= MAX_PAGE_DEPTH}
        <div class="leaflet-reader-fallback">Embedded canvas unavailable.</div>
      {:else}
        <div class="leaflet-embedded-canvas">
          <LeafletBlocks blocks={embedded.blocks} pageType={CANVAS} canvasSize={{ width: embedded.width as number, height: embedded.height as number }} {...shared} depth={depth + 1} />
        </div>
      {/if}
    {:else if type === LINEAR}
      <!-- A linear-document group placed on a canvas: its blocks flow as a column. -->
      <div class="leaflet-canvas-group">
        <LeafletBlocks blocks={(inner.blocks as SerialisedBlock[]) ?? []} {...shared} depth={depth + 1} {inCanvas} />
      </div>
    {:else if type === B("drawing")}
      <LeafletDrawing block={inner} />
    {:else if type === B("postHeader")}
      {#if inCanvas && header}
        <!-- Leaflet only renders this on canvas pages; linear pages keep the
             document's own header, which this site's post hero already shows. -->
        <header class="leaflet-post-header" class:compact={inner.compact === true}>
          {#if publication?.title}<p class="leaflet-post-header-pub">{publication.title}</p>{/if}
          <p class="leaflet-post-header-title">{header.title}</p>
          {#if inner.compact !== true && header.description}<p class="leaflet-post-header-desc">{header.description}</p>{/if}
          {#if header.publishedAt}
            <time datetime={header.publishedAt}>{new Date(header.publishedAt).toLocaleDateString("en-gb", { day: "2-digit", month: "long", year: "numeric" })}</time>
          {/if}
        </header>
      {/if}
    {:else if type === B("recommendedPubs")}
      {#if recommendedPublications.length > 0}
        <section class="leaflet-recommended-pubs" class:compact={inner.compact === true} aria-label="Recommended publications">
          {#each recommendedPublications as rec (rec.uri)}
            {@const href = publicationReferenceHref(rec.uri)}
            {@const name = typeof rec.value.name === "string" ? rec.value.name : "Publication"}
            {@const description = typeof rec.value.description === "string" ? rec.value.description : undefined}
            <article class="leaflet-reference-card leaflet-publication-card">
              {#if href}
                <a {href} class="leaflet-reference-link" target="_blank" rel="noopener noreferrer">
                  <strong>{name}</strong>
                  {#if description}<span>{description}</span>{/if}
                </a>
              {:else}
                <strong>{name}</strong>
              {/if}
            </article>
          {/each}
        </section>
      {/if}
    {:else if type === B("poll")}
      {@const poll = referenceValue(pollRef?.uri)}
      {@const options = Array.isArray(poll?.options) ? (poll.options as Obj[]) : []}
      <section class="leaflet-interactive-card">
        <strong>{typeof poll?.name === "string" ? poll.name : "Poll"}</strong>
        {#if options.length > 0}
          <ul class="leaflet-poll-options">
            {#each options as o, oi (oi)}<li>{typeof o.text === "string" ? o.text : "Option"}</li>{/each}
          </ul>
        {:else}
          <p>Poll options could not be loaded.</p>
        {/if}
        {#if typeof poll?.endDate === "string"}
          <p class="leaflet-interactive-meta">Closes <time datetime={poll.endDate}>{new Date(poll.endDate).toLocaleString("en-gb")}</time></p>
        {/if}
        {#if source}<a href={source} target="_blank" rel="noopener noreferrer">Vote on Leaflet</a>{/if}
      </section>
    {:else if type === B("signup")}
      {@const subscribeHref = safeLinkUrl(publication?.url) ?? source}
      <section class="leaflet-interactive-card">
        <strong>Subscribe</strong>
        <p>Subscription is handled by the publication.</p>
        {#if subscribeHref}
          <a href={subscribeHref} target="_blank" rel="noopener noreferrer">Subscribe on Leaflet</a>
        {/if}
      </section>
    {:else if type === B("membersOnlyDelimiter")}
      <aside class="leaflet-members-gate">
        <strong>Members-only content</strong>
        <p>
          {#if inner.audience === "subscribers"}
            The rest of this post is for subscribers.
          {:else if inner.audience === "tiers"}
            The rest of this post is restricted to selected paid membership tiers.
          {:else}
            The rest of this post is for paid members.
          {/if}
        </p>
        {#if source}<a href={source} target="_blank" rel="noopener noreferrer">Continue on Leaflet</a>{/if}
      </aside>
    {:else}
      <div class="leaflet-reader-fallback">
        <span>Unsupported Leaflet block: <code>{type || "unknown"}</code>.</span>
        {#if source}<a href={source} target="_blank" rel="noopener noreferrer"> Open original</a>{/if}
      </div>
    {/if}
  {/each}
{/if}

{#if footnotes.length > 0}
  <section class="leaflet-footnotes" aria-label="Footnotes">
    <hr />
    <ol>
      {#each footnotes as footnote (footnote.id)}
        {@const anchor = safeAnchor(footnote.id)}
        <li id={`fn-${anchor}`}>
          <LeafletFacets plaintext={footnote.contentPlaintext} facets={footnote.contentFacets} schema={SCHEMA} {footnoteNumbers} />
          <a class="leaflet-footnote-back" href={`#fnref-${anchor}`} aria-label={`Back to footnote ${footnote.index}`}>↩</a>
        </li>
      {/each}
    </ol>
  </section>
{/if}

<style>
  .leaflet-text--small {
    font-size: 0.875em;
  }
  .leaflet-text--large {
    font-size: 1.2em;
  }

  .leaflet-embedded-page,
  .leaflet-reference-card,
  .leaflet-interactive-card,
  .leaflet-members-gate,
  .leaflet-reader-fallback {
    margin-block: 1rem;
    border: 1px solid currentColor;
    border-radius: 0;
    padding: 1rem;
  }

  .leaflet-embedded-page {
    border-style: dashed;
  }
  .leaflet-embedded-page--compact > summary {
    cursor: pointer;
    font-weight: 600;
  }
  .leaflet-embedded-page--compact[open] > summary {
    margin-bottom: 0.75rem;
  }

  .leaflet-embedded-canvas {
    margin-block: 1rem;
    border: 1px solid currentColor;
    border-radius: 0;
  }
  .leaflet-embedded-canvas > :global(.leaflet-canvas) {
    margin-block: 0;
  }

  .leaflet-canvas-group {
    display: flow-root;
  }

  .leaflet-post-header {
    margin-block: 0;
    padding: 1rem;
    border: 1px solid currentColor;
    border-radius: 0;
  }
  .leaflet-post-header p {
    margin-block: 0.25rem;
  }
  .leaflet-post-header-pub {
    font-size: 0.8em;
    opacity: 0.75;
  }
  .leaflet-post-header-title {
    font-size: 1.4em;
    font-weight: 700;
    line-height: 1.2;
  }
  .leaflet-post-header.compact .leaflet-post-header-title {
    font-size: 1.15em;
  }
  .leaflet-post-header time {
    font-size: 0.8em;
    opacity: 0.75;
  }

  .leaflet-recommended-pubs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(14rem, 100%), 1fr));
    gap: 0.75rem;
    margin-block: 1rem;
  }
  .leaflet-recommended-pubs > :global(.leaflet-reference-card) {
    margin-block: 0;
  }
  .leaflet-recommended-pubs.compact {
    display: flex;
    overflow-x: auto;
    scrollbar-width: thin;
  }
  .leaflet-recommended-pubs.compact > :global(.leaflet-reference-card) {
    flex: 0 0 min(16rem, 80%);
  }

  .leaflet-reference-link,
  .leaflet-posts-list a {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: inherit;
    text-decoration: none;
  }

  .leaflet-reference-link:hover strong,
  .leaflet-posts-list a:hover strong {
    text-decoration: underline;
  }

  .leaflet-posts-list {
    display: grid;
    gap: 0.75rem;
    margin-block: 1rem;
  }

  .leaflet-posts-list article {
    border: 1px solid currentColor;
    border-radius: 0;
    padding: 0.75rem 1rem;
    opacity: 0.9;
  }

  .leaflet-posts-list[data-view="small"] {
    gap: 0.4rem;
  }
  .leaflet-posts-list[data-view="small"] article {
    padding-block: 0.5rem;
  }

  .leaflet-posts-list[data-view="chapter"] {
    gap: 1rem;
  }

  .leaflet-posts-list[data-view="chapter"] article {
    padding-block: 1rem;
  }

  .leaflet-posts-list article.highlighted {
    padding-block: 1rem;
    opacity: 1;
  }

  .leaflet-posts-list time {
    font-size: 0.8em;
    opacity: 0.7;
  }

  .leaflet-members-gate {
    border-style: dashed;
    text-align: center;
  }

  .leaflet-members-gate p,
  .leaflet-interactive-card p {
    margin-block: 0.35rem;
  }

  .leaflet-poll-options {
    display: grid;
    gap: 0.5rem;
    margin-block: 0.75rem;
    padding-left: 1.25rem;
  }

  .leaflet-interactive-meta {
    font-size: 0.85em;
    opacity: 0.75;
  }

  .leaflet-html {
    display: block;
    width: 100%;
    min-height: 20rem;
    margin-block: 1rem;
    border: 1px solid currentColor;
    border-radius: 0;
    background: white;
  }

  .leaflet-footnotes {
    margin-top: 2rem;
    font-size: 0.9em;
  }

  .leaflet-footnotes ol {
    padding-left: 1.5rem;
  }
  .leaflet-footnote-back {
    margin-left: 0.4em;
    text-decoration: none;
  }

  .leaflet-reader-fallback {
    font-size: 0.9em;
    opacity: 0.8;
  }
  .leaflet-reader-fallback code {
    overflow-wrap: anywhere;
  }

  .leaflet-canvas {
    position: relative;
    width: 100%;
    min-height: 18rem;
    margin-block: 1rem;
    overflow: visible;
  }

  .leaflet-canvas-block {
    position: absolute;
    min-width: 0;
    transform-origin: center;
  }

  .leaflet-canvas-block > :global(:first-child) {
    margin-top: 0;
  }
  .leaflet-canvas-block > :global(:last-child) {
    margin-bottom: 0;
  }

  .leaflet-canvas--fixed {
    min-height: 0;
    overflow: hidden;
  }

  .leaflet-canvas-unpositioned {
    display: grid;
    gap: 1rem;
    margin-block: 1rem;
  }

  @media (max-width: 42rem) {
    .leaflet-canvas {
      min-height: 14rem;
      overflow-x: auto;
    }
  }
</style>
