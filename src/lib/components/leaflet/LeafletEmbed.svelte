<script lang="ts">
  /**
   * LeafletEmbed — rendered iframe embed from a Leaflet document.
   * Supports explicit height or an aspect-ratio based sizing with
   * a 16:9 fallback for unmeasured embeds.
   */
  import LoadingSkeleton from "$lib/components/LoadingSkeleton.svelte";
  import { safeResourceUrl } from "$lib/utils/url";

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

  /** Remote block data is untrusted — only allow absolute http(s) embeds. */
  let embedSrc = $derived(safeResourceUrl(url));
</script>

{#if embedSrc}
  <div class="leaflet-embed" aria-busy={!loaded}>
    <div class="leaflet-embed-loading" class:is-loaded={loaded} aria-hidden={loaded}>
      <LoadingSkeleton count={3} label="Loading embedded content" />
    </div>
    <iframe
      class:is-loaded={loaded}
      src={embedSrc}
      {height}
      style="aspect-ratio: {ratio}"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups"
      title="Embedded content"
      onload={() => (loaded = true)}
    ></iframe>
  </div>
{/if}
