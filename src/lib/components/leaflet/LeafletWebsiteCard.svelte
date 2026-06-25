<script lang="ts">
  /**
   * LeafletWebsiteCard — rendered link preview from a Leaflet document.
   * Shows a thumbnail, title, description, and the hostname extracted
   * from the destination URL.
   */
  import { ExternalLink } from "@lucide/svelte";

  let { src, title, description, previewImageSrc }: {
    src: string;
    title?: string;
    description?: string;
    previewImageSrc?: string;
  } = $props();
</script>

<a href={src} target="_blank" rel="noopener" class="leaflet-website-card">
  {#if previewImageSrc}
    <div class="website-card-image">
      <img src={previewImageSrc} alt="" loading="lazy" decoding="async" />
    </div>
  {/if}
  <div class="website-card-body">
    {#if title}
      <strong class="website-card-title">{title}</strong>
    {/if}
    {#if description}
      <p class="website-card-desc">{description}</p>
    {/if}
    <span class="website-card-url">
      <ExternalLink size={12} strokeWidth={2} />
      {new URL(src).hostname}
    </span>
  </div>
</a>
