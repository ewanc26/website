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
  import LeafletCanvas from "./LeafletCanvas.svelte";
  import LeafletCode from "./LeafletCode.svelte";
  import LeafletMath from "./LeafletMath.svelte";
  import LeafletEmbed from "./LeafletEmbed.svelte";
  import LeafletWebsiteCard from "./LeafletWebsiteCard.svelte";
  import LeafletButton from "./LeafletButton.svelte";
  import LeafletBskyPost from "./LeafletBskyPost.svelte";
  import Pentacle from "../icons/Pentacle.svelte";
  import Triskele from "../icons/Triskele.svelte";

  import type { FacetSchema } from "$lib/providers/facets";
  import type {
    SerialisedBlock,
    SerialisedPage,
  } from "$lib/providers/serialise";
  import { safeLinkUrl } from "$lib/utils/url";

  const NS = "pub.leaflet.richtext.facet";
  const CANVAS = "pub.leaflet.pages.canvas";
  const SCHEMA: FacetSchema = {
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

  const B = (name: string) => `pub.leaflet.blocks.${name}`;

  interface Obj {
    [key: string]: unknown;
  }

  interface SerialisedFacet {
    $type?: string;
    index: { byteStart: number; byteEnd: number };
    features: { $type?: string; [key: string]: unknown }[];
  }

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

  interface Footnote {
    id: string;
    index: number;
    contentPlaintext: string;
    contentFacets?: SerialisedFacet[];
  }

  let {
    blocks,
    pages = [],
    pageType,
    sourceUrl,
    posts = [],
    publication,
    references = {},
  }: {
    blocks: SerialisedBlock[];
    pages?: SerialisedPage[];
    pageType?: string;
    sourceUrl?: string;
    posts?: ReaderPost[];
    publication?: ReaderPublication | null;
    references?: Record<string, ReaderReference>;
  } = $props();

  const MAX_PAGE_DEPTH = 8;

  function alignmentClass(alignment?: string): string {
    if (!alignment) return "";
    if (alignment.endsWith("textAlignCenter")) return "text-center";
    if (alignment.endsWith("textAlignRight")) return "text-right";
    if (alignment.endsWith("textAlignJustify")) return "text-justify";
    return "";
  }

  function textSizeClass(size: unknown): string {
    if (size === "small") return "leaflet-text--small";
    if (size === "large") return "leaflet-text--large";
    return "";
  }

  function getPlaintext(inner: Obj): string {
    return typeof inner.plaintext === "string" ? inner.plaintext : "";
  }

  function getFacets(inner: Obj): SerialisedFacet[] | undefined {
    return Array.isArray(inner.facets)
      ? (inner.facets as SerialisedFacet[])
      : undefined;
  }

  function getAspectRatio(
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

  /** Keep unauthenticated readers from receiving blocks after a Leaflet gate. */
  function visibleBlocks(items: SerialisedBlock[]): SerialisedBlock[] {
    const gate = items.findIndex(
      (wrapper) => wrapper.block?.$type === B("membersOnlyDelimiter"),
    );
    return gate === -1 ? items : items.slice(0, gate + 1);
  }

  function pageForId(id: unknown): SerialisedPage | undefined {
    return typeof id === "string"
      ? pages.find((page) => page.id === id)
      : undefined;
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
    const remoteUrl = safeLinkUrl(remote?.url);
    if (remoteUrl) return remoteUrl;
    return atReferenceHref(uri);
  }

  function postsForBlock(inner: Obj): ReaderPost[] {
    const currentTags = Array.isArray(inner.filterByTags)
      ? inner.filterByTags.filter(
          (tag): tag is string => typeof tag === "string",
        )
      : [];

    let filtered = currentTags.length
      ? posts.filter((post) =>
          currentTags.every((tag) => post.tags?.includes(tag)),
        )
      : posts;

    const limit =
      typeof inner.limit === "number" && Number.isFinite(inner.limit)
        ? Math.max(0, Math.floor(inner.limit))
        : undefined;
    if (limit && limit > 0) filtered = filtered.slice(0, limit);
    return filtered;
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
          const id =
            typeof feature.footnoteId === "string"
              ? feature.footnoteId
              : undefined;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          found.push({
            id,
            index: found.length + 1,
            contentPlaintext:
              typeof feature.contentPlaintext === "string"
                ? feature.contentPlaintext
                : "",
            contentFacets: Array.isArray(feature.contentFacets)
              ? (feature.contentFacets as SerialisedFacet[])
              : undefined,
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
      if (
        type === B("text") ||
        type === B("header") ||
        type === B("blockquote")
      ) {
        scanFacets(getFacets(inner));
      } else if (type === B("unorderedList")) {
        scanListItems((inner.children as Obj[]) ?? [], false);
      } else if (type === B("orderedList")) {
        scanListItems((inner.children as Obj[]) ?? [], true);
      } else if (type === B("page") && typeof inner.id === "string") {
        if (visitedPages.has(inner.id)) return;
        visitedPages.add(inner.id);
        const page = pageForId(inner.id);
        if (page) scanBlocks(page.blocks);
      }
    };

    const scanBlocks = (items: SerialisedBlock[]) => {
      for (const wrapper of visibleBlocks(items)) scanBlock(wrapper.block);
    };

    scanBlocks(blocks);
    return found;
  }

  let footnotes = $derived(collectFootnotes());
  let footnoteNumbers = $derived(
    Object.fromEntries(
      footnotes.map((footnote) => [footnote.id, footnote.index]),
    ),
  );
</script>

{#snippet listItem(item: Obj, ordered: boolean, depth: number)}
  <li class="leaflet-list-item">
    {#if typeof item.checked === "boolean"}
      <input
        type="checkbox"
        checked={item.checked}
        disabled
        aria-label={item.checked ? "Done" : "Not done"}
      />
    {/if}

    {#if item.content && typeof item.content === "object"}
      {@const content = item.content as Obj}
      {@const contentType = content.$type as string}
      {#if contentType === B("image")}
        {@const ratio = getAspectRatio(content)}
        <LeafletImage
          src={(content._imageSrc as string) ?? ""}
          alt={content.alt as string | undefined}
          width={ratio?.width}
          height={ratio?.height}
        />
      {:else if contentType === B("header")}
        <strong class="leaflet-list-heading">
          <LeafletFacets
            plaintext={getPlaintext(content)}
            facets={getFacets(content)}
            schema={SCHEMA}
            {footnoteNumbers}
          />
        </strong>
      {:else}
        <LeafletFacets
          plaintext={getPlaintext(content)}
          facets={getFacets(content)}
          schema={SCHEMA}
          {footnoteNumbers}
        />
      {/if}
    {/if}

    {#if depth < MAX_PAGE_DEPTH && Array.isArray(item.children) && item.children.length > 0}
      {#if ordered}
        <ol class="leaflet-list ordered nested">
          {#each item.children as child}
            {@render listItem(child as Obj, true, depth + 1)}
          {/each}
        </ol>
      {:else}
        <ul class="leaflet-list nested">
          {#each item.children as child}
            {@render listItem(child as Obj, false, depth + 1)}
          {/each}
        </ul>
      {/if}
    {:else if depth < MAX_PAGE_DEPTH && ordered && item.unorderedListChildren}
      {@const nested = item.unorderedListChildren as Obj}
      <ul class="leaflet-list nested">
        {#each (nested.children as Obj[]) ?? [] as child}
          {@render listItem(child, false, depth + 1)}
        {/each}
      </ul>
    {:else if depth < MAX_PAGE_DEPTH && !ordered && item.orderedListChildren}
      {@const nested = item.orderedListChildren as Obj}
      <ol
        class="leaflet-list ordered nested"
        start={nested.startIndex as number | undefined}
      >
        {#each (nested.children as Obj[]) ?? [] as child}
          {@render listItem(child, true, depth + 1)}
        {/each}
      </ol>
    {/if}
  </li>
{/snippet}

{#snippet renderBlocks(items: SerialisedBlock[], depth: number)}
  {#each visibleBlocks(items) as wrapper, i}
    {@const inner = wrapper.block}
    {@const align = alignmentClass(wrapper.alignment)}
    {@const type = inner.$type as string}

    {#if type === B("text")}
      <p class="leaflet-text {textSizeClass(inner.textSize)}{align ? ` ${align}` : ''}">
        <LeafletFacets
          plaintext={getPlaintext(inner)}
          facets={getFacets(inner)}
          schema={SCHEMA}
          {footnoteNumbers}
        />
      </p>

    {:else if type === B("header")}
      {@const level = Math.min(Math.max((inner.level as number) ?? 1, 1), 6)}
      {@const id = headingId(getPlaintext(inner), i)}
      {#if level <= 2}
        <h2 id={id} class={level === 1 ? `leaflet-h1 ${align}` : `leaflet-h2 ${align}`}>
          <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} {footnoteNumbers} />
        </h2>
      {:else if level === 3}
        <h3 id={id} class="leaflet-h3 {align}">
          <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} {footnoteNumbers} />
        </h3>
      {:else if level === 4}
        <h4 id={id} class="leaflet-h4 {align}">
          <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} {footnoteNumbers} />
        </h4>
      {:else if level === 5}
        <h5 id={id} class="leaflet-h5 {align}">
          <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} {footnoteNumbers} />
        </h5>
      {:else}
        <h6 id={id} class="leaflet-h6 {align}">
          <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} {footnoteNumbers} />
        </h6>
      {/if}

    {:else if type === B("blockquote")}
      <blockquote class="leaflet-blockquote{align ? ` ${align}` : ''}">
        <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} {footnoteNumbers} />
      </blockquote>

    {:else if type === B("code")}
      <LeafletCode
        plaintext={(inner.plaintext as string) ?? ""}
        language={inner.language as string | undefined}
      />

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
      {@const ratio = getAspectRatio(inner)}
      <LeafletImage
        src={(inner._imageSrc as string) ?? ""}
        alt={inner.alt as string | undefined}
        width={ratio?.width}
        height={ratio?.height}
        fullBleed={inner.fullBleed as boolean | undefined}
      />

    {:else if type === B("imageGallery")}
      <LeafletImageGallery
        images={(inner.images as Obj[]) ?? []}
        format={inner.format as string | undefined}
      />

    {:else if type === B("unorderedList")}
      <ul class="leaflet-list{align ? ` ${align}` : ''}">
        {#each (inner.children as Obj[]) ?? [] as item}
          {@render listItem(item, false, 0)}
        {/each}
      </ul>

    {:else if type === B("orderedList")}
      <ol
        class="leaflet-list ordered{align ? ` ${align}` : ''}"
        start={inner.startIndex as number | undefined}
      >
        {#each (inner.children as Obj[]) ?? [] as item}
          {@render listItem(item, true, 0)}
        {/each}
      </ol>

    {:else if type === B("iframe")}
      <LeafletEmbed
        url={(inner.url as string) ?? ""}
        height={inner.height as number | undefined}
        aspectRatio={getAspectRatio(inner)}
      />

    {:else if type === B("html")}
      {@const html = typeof inner.html === "string" ? inner.html : typeof inner.content === "string" ? inner.content : ""}
      {#if html}
        <iframe
          class="leaflet-html"
          title="Embedded Leaflet HTML"
          srcdoc={html}
          sandbox=""
          loading="lazy"
        ></iframe>
      {:else}
        <div class="leaflet-reader-fallback">HTML block has no readable content.</div>
      {/if}

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
      <LeafletBskyPost
        {postRef}
        clientHost={inner.clientHost as string | undefined}
        record={references[postRef?.uri]}
      />

    {:else if type === B("standardSitePost")}
      {@const href = atReferenceHref(inner.uri)}
      {@const localPost = typeof inner.uri === "string" ? posts.find((post) => post.uri === inner.uri) : undefined}
      {@const remotePost = referenceValue(inner.uri)}
      {@const remoteTitle = typeof remotePost?.title === "string" ? remotePost.title : undefined}
      {@const remoteDescription = typeof remotePost?.description === "string" ? remotePost.description : undefined}
      <article class="leaflet-reference-card" data-size={(inner.size as string) ?? "medium"}>
        {#if href}
          <a href={href} class="leaflet-reference-link">
            <strong>{localPost?.title ?? remoteTitle ?? "Referenced post"}</strong>
            {#if localPost?.description ?? remoteDescription}
              <span>{localPost?.description ?? remoteDescription}</span>
            {/if}
          </a>
        {:else}
          <em>Post not found.</em>
        {/if}
      </article>

    {:else if type === B("standardSitePublication")}
      {@const href = publicationReferenceHref(inner.uri)}
      {@const remotePublication = referenceValue(inner.uri)}
      {@const isLocalPublication = publication?.uri === inner.uri}
      {@const publicationTitle = isLocalPublication ? publication?.title : typeof remotePublication?.name === "string" ? remotePublication.name : "Referenced publication"}
      {@const publicationDescription = isLocalPublication ? publication?.description : typeof remotePublication?.description === "string" ? remotePublication.description : undefined}
      <article class="leaflet-reference-card leaflet-publication-card">
        {#if href}
          <a href={href} class="leaflet-reference-link">
            <strong>{publicationTitle}</strong>
            {#if publicationDescription}<span>{publicationDescription}</span>{/if}
          </a>
        {:else}
          <em>Publication not found.</em>
        {/if}
      </article>

    {:else if type === B("postsList")}
      {@const listed = postsForBlock(inner)}
      <section class="leaflet-posts-list" data-view={(inner.view as string) ?? "small"} aria-label="Publication posts">
        {#if listed.length}
          {#each listed as post, postIndex}
            <article class:highlighted={inner.highlightFirstPost === true && postIndex === 0}>
              <a href={safeLinkUrl(post.url)}>
                <strong>{post.title}</strong>
                {#if (inner.view === "medium" || inner.view === "chapter") && post.description}
                  <span>{post.description}</span>
                {/if}
                {#if post.createdAt}
                  <time datetime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString("en-gb")}</time>
                {/if}
              </a>
            </article>
          {/each}
        {:else}
          <p class="leaflet-reader-fallback">No matching publication posts.</p>
        {/if}
      </section>

    {:else if type === B("page")}
      {@const embeddedPage = pageForId(inner.id)}
      {#if embeddedPage && depth < MAX_PAGE_DEPTH}
        <section class="leaflet-embedded-page" aria-label="Embedded Leaflet page">
          {#if embeddedPage.$type === CANVAS}
            <LeafletCanvas blocks={visibleBlocks(embeddedPage.blocks)}>
              {#snippet renderBlock(canvasBlock)}
                {@render renderBlocks([canvasBlock], depth + 1)}
              {/snippet}
            </LeafletCanvas>
          {:else}
            {@render renderBlocks(embeddedPage.blocks, depth + 1)}
          {/if}
        </section>
      {:else}
        <div class="leaflet-reader-fallback">Embedded page unavailable.</div>
      {/if}

    {:else if type === B("poll")}
      {@const pollRef = inner.pollRef as { uri?: string; cid?: string } | undefined}
      {@const poll = referenceValue(pollRef?.uri)}
      {@const options = Array.isArray(poll?.options) ? poll.options as Obj[] : []}
      <section class="leaflet-interactive-card">
        <strong>{typeof poll?.name === "string" ? poll.name : "Poll"}</strong>
        {#if options.length > 0}
          <ul class="leaflet-poll-options">
            {#each options as option}
              <li>{typeof option.text === "string" ? option.text : "Option"}</li>
            {/each}
          </ul>
        {:else}
          <p>Poll options could not be loaded.</p>
        {/if}
        {#if typeof poll?.endDate === "string"}
          <p class="leaflet-interactive-meta">
            Closes <time datetime={poll.endDate as string}>{new Date(poll.endDate as string).toLocaleString("en-gb")}</time>
          </p>
        {/if}
        {#if sourceHref()}<a href={sourceHref()} target="_blank" rel="noopener noreferrer">Vote on Leaflet</a>{/if}
      </section>

    {:else if type === B("signup")}
      <section class="leaflet-interactive-card">
        <strong>Subscribe</strong>
        <p>Subscription is handled by the publication.</p>
        {#if safeLinkUrl(publication?.url) ?? sourceHref()}
          <a href={safeLinkUrl(publication?.url) ?? sourceHref()} target="_blank" rel="noopener noreferrer">Subscribe on Leaflet</a>
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
        {#if sourceHref()}<a href={sourceHref()} target="_blank" rel="noopener noreferrer">Continue on Leaflet</a>{/if}
      </aside>

    {:else}
      <div class="leaflet-reader-fallback">
        <span>Unsupported Leaflet block: <code>{type || "unknown"}</code>.</span>
        {#if sourceHref()} <a href={sourceHref()} target="_blank" rel="noopener noreferrer">Open original</a>{/if}
      </div>
    {/if}
  {/each}
{/snippet}

{#if pageType === CANVAS}
  <LeafletCanvas blocks={visibleBlocks(blocks)}>
    {#snippet renderBlock(canvasBlock)}
      {@render renderBlocks([canvasBlock], 0)}
    {/snippet}
  </LeafletCanvas>
{:else}
  {@render renderBlocks(blocks, 0)}
{/if}

{#if footnotes.length > 0}
  <section class="leaflet-footnotes" aria-label="Footnotes">
    <hr />
    <ol>
      {#each footnotes as footnote}
        {@const anchor = safeAnchor(footnote.id)}
        <li id={`fn-${anchor}`}>
          <LeafletFacets
            plaintext={footnote.contentPlaintext}
            facets={footnote.contentFacets}
            schema={SCHEMA}
            {footnoteNumbers}
          />
          <a class="leaflet-footnote-back" href={`#fnref-${anchor}`} aria-label={`Back to footnote ${footnote.index}`}>↩</a>
        </li>
      {/each}
    </ol>
  </section>
{/if}

<style>
  .leaflet-text--small { font-size: 0.875em; }
  .leaflet-text--large { font-size: 1.2em; }

  .leaflet-embedded-page,
  .leaflet-reference-card,
  .leaflet-interactive-card,
  .leaflet-members-gate,
  .leaflet-reader-fallback {
    margin-block: 1rem;
    border: 1px solid currentColor;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .leaflet-embedded-page { border-style: dashed; }

  .leaflet-reference-link,
  .leaflet-posts-list a {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: inherit;
    text-decoration: none;
  }

  .leaflet-reference-link:hover strong,
  .leaflet-posts-list a:hover strong { text-decoration: underline; }

  .leaflet-posts-list {
    display: grid;
    gap: 0.75rem;
    margin-block: 1rem;
  }

  .leaflet-posts-list article {
    border: 1px solid currentColor;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    opacity: 0.9;
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

  .leaflet-posts-list time { font-size: 0.8em; opacity: 0.7; }

  .leaflet-members-gate {
    border-style: dashed;
    text-align: center;
  }

  .leaflet-members-gate p,
  .leaflet-interactive-card p { margin-block: 0.35rem; }

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
    border-radius: 0.5rem;
    background: white;
  }

  .leaflet-footnotes {
    margin-top: 2rem;
    font-size: 0.9em;
  }

  .leaflet-footnotes ol { padding-left: 1.5rem; }
  .leaflet-footnote-back { margin-left: 0.4em; text-decoration: none; }

  .leaflet-reader-fallback { font-size: 0.9em; opacity: 0.8; }
  .leaflet-reader-fallback code { overflow-wrap: anywhere; }
</style>
