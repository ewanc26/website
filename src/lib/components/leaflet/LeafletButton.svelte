<script lang="ts">
  /**
   * Render a Leaflet button block.
   */

  let { text, url }: { text: string; url: string } = $props();
</script>

<div class="leaflet-button">
  <a href={url} target="_blank" rel="noopener">{text}</a>
</div>
