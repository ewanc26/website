<script lang="ts">
  /**
   * LeafletBlocks — renders an array of Leaflet linearDocument blocks
   * as native Svelte components instead of flattening to markdown.
   *
   * Each block in the array has the shape:
   *   { block: { $type: "pub.leaflet.blocks.<name>", ... }, alignment?: string }
   *
   * The block data is pre-serialised on the server (BlobRef → image URL,
   * CID instances → strings) so it's safe for SvelteKit dehydration.
   */

  import LeafletFacets from "./LeafletFacets.svelte";
  import LeafletImage from "./LeafletImage.svelte";
  import LeafletCode from "./LeafletCode.svelte";
  import LeafletMath from "./LeafletMath.svelte";
  import LeafletEmbed from "./LeafletEmbed.svelte";
  import LeafletWebsiteCard from "./LeafletWebsiteCard.svelte";
  import LeafletButton from "./LeafletButton.svelte";
  import LeafletBskyPost from "./LeafletBskyPost.svelte";

  import type { FacetSchema } from "$lib/providers/facets";
  import type { SerialisedBlock } from "$lib/providers/serialise";

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

  interface SerialisedFacet {
    $type?: string;
    index: { byteStart: number; byteEnd: number };
    features: { $type?: string; [k: string]: unknown }[];
  }

  let { blocks }: { blocks: SerialisedBlock[] } = $props();

  /** Track heading slugs for duplicate disambiguation. */
  const headingCounts = new Map<string, number>();

  /** Generate a heading id matching rehype-slug output. */
  function headingId(text: string): string {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    const count = headingCounts.get(base) ?? 0;
    headingCounts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  }

  function alignmentClass(alignment?: string): string {
    if (!alignment) return "";
    if (alignment.endsWith("textAlignCenter")) return "text-center";
    if (alignment.endsWith("textAlignRight")) return "text-right";
    if (alignment.endsWith("textAlignJustify")) return "text-justify";
    return "";
  }

  /** Extract plaintext + facets from a block inner object. */
  function getPlaintext(inner: Record<string, unknown>): string {
    return (inner.plaintext as string) ?? "";
  }

  function getFacets(inner: Record<string, unknown>): SerialisedFacet[] | undefined {
    return inner.facets as SerialisedFacet[] | undefined;
  }

  /** Safely read aspectRatio from a block. */
  function getAspectRatio(inner: Record<string, unknown>): { width: number; height: number } | undefined {
    const ar = inner.aspectRatio;
    if (typeof ar === "object" && ar !== null && "width" in ar && "height" in ar) {
      return ar as { width: number; height: number };
    }
    return undefined;
  }
</script>

{#each blocks as wrapper, i}
  {@const inner = wrapper.block}
  {@const align = alignmentClass(wrapper.alignment)}
  {@const $type = inner.$type as string}

  {#if $type === B("text")}
    <p class="leaflet-text{align ? ` ${align}` : ''}">
      <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} />
    </p>

  {:else if $type === B("header")}
    {@const level = Math.min(Math.max((inner.level as number) ?? 1, 1), 6)}
    {@const hid = headingId(getPlaintext(inner))}
    {#if level === 1}
      <h1 id={hid} class="leaflet-h1{align ? ` ${align}` : ''}">
        <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} />
      </h1>
    {:else if level === 2}
      <h2 id={hid} class="leaflet-h2{align ? ` ${align}` : ''}">
        <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} />
      </h2>
    {:else if level === 3}
      <h3 id={hid} class="leaflet-h3{align ? ` ${align}` : ''}">
        <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} />
      </h3>
    {:else if level === 4}
      <h4 id={hid} class="leaflet-h4{align ? ` ${align}` : ''}">
        <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} />
      </h4>
    {:else if level === 5}
      <h5 id={hid} class="leaflet-h5{align ? ` ${align}` : ''}">
        <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} />
      </h5>
    {:else}
      <h6 id={hid} class="leaflet-h6{align ? ` ${align}` : ''}">
        <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} />
      </h6>
    {/if}

  {:else if $type === B("blockquote")}
    <blockquote class="leaflet-blockquote{align ? ` ${align}` : ''}">
      <LeafletFacets plaintext={getPlaintext(inner)} facets={getFacets(inner)} schema={SCHEMA} />
    </blockquote>

  {:else if $type === B("code")}
    <LeafletCode plaintext={(inner.plaintext as string) ?? ""} language={inner.language as string | undefined} />

  {:else if $type === B("math")}
    <LeafletMath tex={(inner.tex as string) ?? ""} />

  {:else if $type === B("horizontalRule")}
    <hr class="leaflet-hr" />

  {:else if $type === B("image")}
    {@const ar = getAspectRatio(inner)}
    <LeafletImage
      src={inner._imageSrc as string}
      alt={inner.alt as string | undefined}
      width={ar?.width}
      height={ar?.height}
      fullBleed={inner.fullBleed as boolean | undefined}
    />

  {:else if $type === B("unorderedList")}
    <ul class="leaflet-list{align ? ` ${align}` : ''}">
      {#each (inner.children as Record<string, unknown>[]) ?? [] as item}
        {@render listItem(item, false)}
      {/each}
    </ul>

  {:else if $type === B("orderedList")}
    <ol class="leaflet-list ordered{align ? ` ${align}` : ''}" start={inner.startIndex as number | undefined}>
      {#each (inner.children as Record<string, unknown>[]) ?? [] as item}
        {@render listItem(item, true)}
      {/each}
    </ol>

  {:else if $type === B("iframe")}
    <LeafletEmbed
      url={inner.url as string}
      height={inner.height as number | undefined}
      aspectRatio={getAspectRatio(inner)}
    />

  {:else if $type === B("website")}
    <LeafletWebsiteCard
      src={inner.src as string}
      title={inner.title as string | undefined}
      description={inner.description as string | undefined}
      previewImageSrc={inner._previewImageSrc as string | undefined}
    />

  {:else if $type === B("button")}
    <LeafletButton text={inner.text as string} url={inner.url as string} />

  {:else if $type === B("bskyPost")}
    <LeafletBskyPost
      postRef={inner.postRef as { uri: string; cid: string }}
      clientHost={inner.clientHost as string | undefined}
    />

  {:else if $type === B("page")}
    <div class="leaflet-unsupported">Embedded page</div>

  {:else if $type === B("poll")}
    <div class="leaflet-unsupported">Poll</div>

  {:else if $type === B("postsList")}
    <div class="leaflet-unsupported">Posts list</div>

  {:else if $type === B("signup")}
    <div class="leaflet-unsupported">Signup form</div>

  {:else if $type === B("standardSitePost")}
    <div class="leaflet-unsupported">
      <a href={inner.uri as string} target="_blank" rel="noopener">Linked post</a>
    </div>

  {:else}
    <!-- Unknown block type — skip silently -->
  {/if}
{/each}

{#snippet listItem(item: Record<string, unknown>, ordered: boolean)}
  <li class="leaflet-list-item">
    {#if item.checked !== undefined}
      <input type="checkbox" checked={item.checked as boolean} disabled />
    {/if}
    {#if item.content}
      {@const content = item.content as Record<string, unknown>}
      {@const contentType = content.$type as string}
      {#if contentType === B("image")}
        {@const ar = getAspectRatio(content)}
        <LeafletImage
          src={content._imageSrc as string}
          alt={content.alt as string | undefined}
          width={ar?.width}
          height={ar?.height}
        />
      {:else}
        <LeafletFacets plaintext={getPlaintext(content)} facets={getFacets(content)} schema={SCHEMA} />
      {/if}
    {/if}
    {#if Array.isArray(item.children) && item.children.length > 0}
      <ul class="leaflet-list nested">
        {#each item.children as child}
          {@render listItem(child, false)}
        {/each}
      </ul>
    {:else if item.orderedListChildren}
      {@const olc = item.orderedListChildren as Record<string, unknown>}
      <ol class="leaflet-list ordered nested" start={olc.startIndex as number | undefined}>
        {#each (olc.children as Record<string, unknown>[]) ?? [] as child}
          {@render listItem(child, true)}
        {/each}
      </ol>
    {/if}
  </li>
{/snippet}
