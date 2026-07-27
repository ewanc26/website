<script lang="ts">
  /**
   * LeafletButton — rendered button block from a Leaflet document.
   * Opens the linked URL in a new tab with rel=noopener.
   */
  import { safeLinkUrl } from "$lib/utils/url";

  let { text, url }: { text: string; url: string } = $props();

  /** Remote block data is untrusted — reject javascript:/data: hrefs. */
  let href = $derived(safeLinkUrl(url));
</script>

{#if href}
  <div class="leaflet-button">
    <a {href} target="_blank" rel="noopener noreferrer">{text}</a>
  </div>
{/if}
