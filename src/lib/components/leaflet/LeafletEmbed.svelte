<script lang="ts">
  /**
   * LeafletEmbed — rendered iframe embed from a Leaflet document.
   * Supports explicit height or an aspect-ratio based sizing with
   * a 16:9 fallback for unmeasured embeds.
   */
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
</script>

<div class="leaflet-embed">
  <iframe
    src={url}
    {height}
    style="aspect-ratio: {ratio}"
    loading="lazy"
    sandbox="allow-scripts allow-same-origin allow-popups"
    title="Embedded content"
  ></iframe>
</div>
