<script lang="ts">
  import { inkColor, inkFillPath, inkStrokePath, parseFills, parseStrokes, parseViewBox } from "$lib/utils/leafletInk";

  type Obj = Record<string, unknown>;
  interface Props {
    block: Obj;
  }
  let { block }: Props = $props();
  const box = $derived(parseViewBox(block.viewBox));
  const fills = $derived(parseFills(block.fills));
  const strokes = $derived(parseStrokes(block.strokes));
</script>

{#if box}
  <figure class="leaflet-drawing">
    <svg viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`} overflow="visible" style={`aspect-ratio:${box.width}/${box.height}`} role="img" aria-label="Drawing">
      {#each fills as fill, i (i)}
        <path d={inkFillPath(fill)} fill={inkColor(fill.color)} />
      {/each}
      {#each strokes as stroke, i (i)}
        <path d={inkStrokePath(stroke)} fill={inkColor(stroke.color)} />
      {/each}
    </svg>
  </figure>
{:else}
  <div class="leaflet-reader-fallback">Drawing has no readable view box.</div>
{/if}

<style>
  .leaflet-drawing {
    margin-block: 1rem;
    margin-inline: 0;
  }

  .leaflet-drawing svg {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
