<script lang="ts">
  /**
   * Render a Leaflet image block.
   * The `src` is a pre-resolved PDS blob URL (set during serialisation).
   */

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
</script>

<figure class="leaflet-image" class:full-bleed={fullBleed}>
  <img
    src={src}
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
