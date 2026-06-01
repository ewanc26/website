<script lang="ts">
  /**
   * Render a Leaflet iframe/embed block.
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
