<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SerialisedBlock } from "$lib/providers/serialise";

  let {
    blocks,
    renderBlock,
  }: {
    blocks: SerialisedBlock[];
    renderBlock: Snippet<[SerialisedBlock]>;
  } = $props();

  interface Metrics {
    minX: number;
    minY: number;
    width: number;
    height: number;
  }

  function finiteNumber(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value)
      ? value
      : undefined;
  }

  function isPositioned(block: SerialisedBlock): boolean {
    const x = finiteNumber(block.x);
    const y = finiteNumber(block.y);
    const width = finiteNumber(block.width);
    return x !== undefined && y !== undefined && width !== undefined && width > 0;
  }

  function estimatedHeight(block: SerialisedBlock): number {
    const explicit = finiteNumber(block.height);
    if (explicit !== undefined && explicit > 0) return explicit;

    // Height is optional in the Leaflet canvas lexicon. Keep the bounding box
    // useful for auto-sized text/cards while allowing the rendered block itself
    // to grow naturally if its content is taller than this estimate.
    const width = finiteNumber(block.width) ?? 320;
    return Math.max(160, Math.min(480, width * 0.6));
  }

  function measure(items: SerialisedBlock[]): Metrics {
    const positioned = items.filter(isPositioned);
    if (!positioned.length) {
      return { minX: 0, minY: 0, width: 1000, height: 700 };
    }

    const minX = Math.min(...positioned.map((block) => block.x as number));
    const minY = Math.min(...positioned.map((block) => block.y as number));
    const maxX = Math.max(
      ...positioned.map(
        (block) => (block.x as number) + (block.width as number),
      ),
    );
    const maxY = Math.max(
      ...positioned.map(
        (block) => (block.y as number) + estimatedHeight(block),
      ),
    );

    return {
      minX,
      minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    };
  }

  function styleFor(block: SerialisedBlock, metrics: Metrics): string {
    const x = finiteNumber(block.x) ?? metrics.minX;
    const y = finiteNumber(block.y) ?? metrics.minY;
    const width = Math.max(1, finiteNumber(block.width) ?? metrics.width);
    const height = finiteNumber(block.height);
    const rotation = finiteNumber(block.rotation);

    const declarations = [
      `left:${((x - metrics.minX) / metrics.width) * 100}%`,
      `top:${((y - metrics.minY) / metrics.height) * 100}%`,
      `width:${(width / metrics.width) * 100}%`,
    ];

    if (height !== undefined && height > 0) {
      declarations.push(`min-height:${(height / metrics.height) * 100}%`);
    }
    if (rotation !== undefined) {
      declarations.push(`transform:rotate(${rotation}deg)`);
    }

    return declarations.join(";");
  }

  let metrics = $derived(measure(blocks));
  let positioned = $derived(blocks.filter(isPositioned));
  let unpositioned = $derived(blocks.filter((block) => !isPositioned(block)));
</script>

{#if positioned.length > 0}
  <div
    class="leaflet-canvas"
    style={`aspect-ratio:${metrics.width}/${metrics.height}`}
    aria-label="Leaflet canvas"
  >
    {#each positioned as block}
      <div class="leaflet-canvas-block" style={styleFor(block, metrics)}>
        {@render renderBlock(block)}
      </div>
    {/each}
  </div>
{/if}

{#if unpositioned.length > 0}
  <div class="leaflet-canvas-unpositioned" aria-label="Unpositioned canvas content">
    {#each unpositioned as block}
      {@render renderBlock(block)}
    {/each}
  </div>
{/if}

<style>
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

  .leaflet-canvas-block :global(> :first-child) {
    margin-top: 0;
  }

  .leaflet-canvas-block :global(> :last-child) {
    margin-bottom: 0;
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
