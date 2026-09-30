<script lang="ts">
  import { safeLinkUrl } from "$lib/utils/url";

  interface Props {
    text: string;
    url: string;
  }
  let { text, url }: Props = $props();
  // Remote block data is untrusted — reject javascript:/data: hrefs.
  const href = $derived(safeLinkUrl(url));
</script>

{#if href}
  <div class="leaflet-button">
    <a {href} target="_blank" rel="noopener noreferrer">{text}</a>
  </div>
{/if}
