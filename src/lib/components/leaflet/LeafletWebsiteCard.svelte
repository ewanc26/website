<script lang="ts">
  /**
   * LeafletWebsiteCard — rendered link preview from a Leaflet document.
   * Shows a thumbnail, title, description, and the hostname extracted
   * from the destination URL.
   */
  import { ExternalLink } from "@lucide/svelte";
  import { safeHostname, safeLinkUrl, safeResourceUrl } from "$lib/utils/url";

  let { src, title, description, previewImageSrc }: {
    src: string;
    title?: string;
    description?: string;
    previewImageSrc?: string;
  } = $props();

  // Remote block data is untrusted: reject unsafe schemes, and never let a
  // malformed URL throw out of `new URL()` and take down the whole render.
  let href = $derived(safeLinkUrl(src));
  let hostname = $derived(safeHostname(src));
  let previewSrc = $derived(safeResourceUrl(previewImageSrc));
</script>

{#if href}
  <a {href} target="_blank" rel="noopener noreferrer" class="leaflet-website-card">
    {#if previewSrc}
      <div class="website-card-image">
        <img src={previewSrc} alt="" loading="lazy" decoding="async" />
      </div>
    {/if}
    <div class="website-card-body">
      {#if title}
        <strong class="website-card-title">{title}</strong>
      {/if}
      {#if description}
        <p class="website-card-desc">{description}</p>
      {/if}
      {#if hostname}
        <span class="website-card-url">
          <ExternalLink size={12} strokeWidth={2} aria-hidden="true" />
          {hostname}
        </span>
      {/if}
    </div>
  </a>
{/if}
