<script lang="ts">
  /**
   * LeafletEmbed — rendered iframe embed from a Leaflet document.
   * Supports explicit height or an aspect-ratio based sizing with
   * a 16:9 fallback for unmeasured embeds.
   */
  import LoadingSkeleton from "$lib/components/LoadingSkeleton.svelte";

  let { url, height, aspectRatio }: {
    url: string;
    height?: number;
    aspectRatio?: { width: number; height: number };
  } = $props();

  let ratio = $derived(
    aspectRatio && aspectRatio.width > 0 && aspectRatio.height > 0
      ? `${aspectRatio.width} / ${aspectRatio.height}`
      : "16 / 9"
  );
  let loaded = $state(false);
</script>

<div class="leaflet-embed" aria-busy={!loaded}>
  {#if !loaded}
    <div class="leaflet-embed-loading">
      <LoadingSkeleton count={3} label="Loading embedded content" />
    </div>
  {/if}
  <iframe
    src={url}
    {height}
    style="aspect-ratio: {ratio}"
    loading="lazy"
    sandbox="allow-scripts allow-same-origin allow-popups"
    title="Embedded content"
    onload={() => (loaded = true)}
  ></iframe>
</div>
