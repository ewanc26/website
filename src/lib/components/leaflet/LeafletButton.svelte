<script lang="ts">
  /**
   * LeafletButton — rendered button block from a Leaflet document.
   * Opens the linked URL in a new tab with rel=noopener.
   */
  let { text, url }: { text: string; url: string } = $props();
</script>

<div class="leaflet-button">
  <a href={url} target="_blank" rel="noopener">{text}</a>
</div>
