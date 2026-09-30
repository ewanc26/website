<script lang="ts">
  import { ExternalLink } from "@lucide/svelte";
  import { safeHostname, safeLinkUrl, safeResourceUrl } from "$lib/utils/url";

  interface Props {
    src: string;
    title?: string;
    description?: string;
    previewImageSrc?: string;
  }
  let { src, title, description, previewImageSrc }: Props = $props();
  // Remote block data is untrusted: reject unsafe schemes; safeHostname never throws.
  const href = $derived(safeLinkUrl(src));
  const hostname = $derived(safeHostname(src));
  const previewSrc = $derived(safeResourceUrl(previewImageSrc));
</script>

{#if href}
  <a {href} target="_blank" rel="noopener noreferrer" class="leaflet-website-card">
    {#if previewSrc}
      <div class="website-card-image"><img src={previewSrc} alt="" loading="lazy" decoding="async" /></div>
    {/if}
    <div class="website-card-body">
      {#if title}<strong class="website-card-title">{title}</strong>{/if}
      {#if description}<p class="website-card-desc">{description}</p>{/if}
      {#if hostname}
        <span class="website-card-url"><ExternalLink size={12} /> {hostname}</span>
      {/if}
    </div>
  </a>
{/if}
