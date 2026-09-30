<script lang="ts">
  import LeafletFacets from "./LeafletFacets.svelte";
  import LeafletImage from "./LeafletImage.svelte";
  import LeafletListItem from "./LeafletListItem.svelte";
  import { B, MAX_PAGE_DEPTH, SCHEMA, getAspectRatio, getFacets, getPlaintext, type Obj } from "$lib/utils/leafletReader";

  interface Props {
    item: Obj;
    ordered: boolean;
    depth: number;
    footnoteNumbers: Record<string, number>;
  }
  let { item, ordered, depth, footnoteNumbers }: Props = $props();

  const content = $derived(item.content && typeof item.content === "object" ? (item.content as Obj) : undefined);
  const contentType = $derived(content?.$type as string | undefined);
  const ratio = $derived(content ? getAspectRatio(content) : undefined);
  const canNest = $derived(depth < MAX_PAGE_DEPTH);
  const children = $derived(Array.isArray(item.children) ? (item.children as Obj[]) : []);
  const unorderedNested = $derived(item.unorderedListChildren as Obj | undefined);
  const orderedNested = $derived(item.orderedListChildren as Obj | undefined);
</script>

<li class="leaflet-list-item">
  {#if typeof item.checked === "boolean"}
    <input type="checkbox" checked={item.checked} disabled aria-label={item.checked ? "Done" : "Not done"} />
  {/if}
  {#if content && contentType === B("image")}
    <LeafletImage src={(content._imageSrc as string) ?? ""} alt={content.alt as string | undefined} width={ratio?.width} height={ratio?.height} />
  {:else if content && contentType === B("header")}
    <strong class="leaflet-list-heading">
      <LeafletFacets plaintext={getPlaintext(content)} facets={getFacets(content)} schema={SCHEMA} {footnoteNumbers} />
    </strong>
  {:else if content}
    <LeafletFacets plaintext={getPlaintext(content)} facets={getFacets(content)} schema={SCHEMA} {footnoteNumbers} />
  {/if}

  {#if canNest && children.length > 0}
    {#if ordered}
      <ol class="leaflet-list ordered nested">
        {#each children as child, i (i)}
          <LeafletListItem item={child} ordered={true} depth={depth + 1} {footnoteNumbers} />
        {/each}
      </ol>
    {:else}
      <ul class="leaflet-list nested">
        {#each children as child, i (i)}
          <LeafletListItem item={child} ordered={false} depth={depth + 1} {footnoteNumbers} />
        {/each}
      </ul>
    {/if}
  {:else if canNest && ordered && unorderedNested}
    <ul class="leaflet-list nested">
      {#each (unorderedNested.children as Obj[]) ?? [] as child, i (i)}
        <LeafletListItem item={child} ordered={false} depth={depth + 1} {footnoteNumbers} />
      {/each}
    </ul>
  {:else if canNest && !ordered && orderedNested}
    <ol class="leaflet-list ordered nested" start={orderedNested.startIndex as number | undefined}>
      {#each (orderedNested.children as Obj[]) ?? [] as child, i (i)}
        <LeafletListItem item={child} ordered={true} depth={depth + 1} {footnoteNumbers} />
      {/each}
    </ol>
  {/if}
</li>
