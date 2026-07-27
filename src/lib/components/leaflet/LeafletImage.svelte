<script lang="ts">
  /**
   * Render a Leaflet image block.
   * The `src` is a pre-resolved PDS blob URL (set during serialisation).
   */

  import { safeResourceUrl } from "$lib/utils/url";

  let { src, alt, width, height, fullBleed }: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    fullBleed?: boolean;
  } = $props();

  let aspectRatio = $derived(
    width && height && width > 0 && height > 0
      ? `${width} / ${height}`
      : undefined
  );

  /** Blob URLs are resolved server-side, but the record is still untrusted. */
  let imageSrc = $derived(safeResourceUrl(src));
</script>

{#if imageSrc}
<figure class="leaflet-image" class:full-bleed={fullBleed}>
  <img
    src={imageSrc}
    alt={alt ?? ""}
    {width}
    {height}
    style={aspectRatio ? `aspect-ratio: ${aspectRatio}` : undefined}
    loading="lazy"
    decoding="async"
  />
  {#if alt}
    <figcaption class="leaflet-image-alt">{alt}</figcaption>
  {/if}
</figure>
{/if}
