<script lang="ts">
  import { safeResourceUrl } from "$lib/utils/url";

  type Obj = Record<string, unknown>;

  let { images, format = "grid" }: {
    images: Obj[];
    format?: string;
  } = $props();

  function aspectRatio(image: Obj): string | undefined {
    const ratio = image.aspectRatio;
    if (!ratio || typeof ratio !== "object") return undefined;
    const { width, height } = ratio as { width?: number; height?: number };
    return width && height && width > 0 && height > 0
      ? `${width} / ${height}`
      : undefined;
  }

  function imageSrc(image: Obj): string | undefined {
    return safeResourceUrl(image._imageSrc);
  }

  let mode = $derived(
    format === "carousel" || format === "strip" ? format : "grid",
  );
</script>

<div
  class="leaflet-gallery"
  class:leaflet-gallery--grid={mode === "grid"}
  class:leaflet-gallery--strip={mode === "strip"}
  class:leaflet-gallery--carousel={mode === "carousel"}
  aria-label="Image gallery"
>
  {#each images as image}
    {@const src = imageSrc(image)}
    {#if src}
      <figure class="leaflet-gallery-item">
        <img
          src={src}
          alt={(image.alt as string | undefined) ?? ""}
          style={aspectRatio(image) ? `aspect-ratio: ${aspectRatio(image)}` : undefined}
          loading="lazy"
          decoding="async"
        />
        {#if image.alt}
          <figcaption>{image.alt as string}</figcaption>
        {/if}
      </figure>
    {/if}
  {/each}
</div>

<style>
  .leaflet-gallery {
    margin-block: var(--space-md);
  }

  .leaflet-gallery--grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr));
    gap: var(--space-xs);
  }

  .leaflet-gallery--strip,
  .leaflet-gallery--carousel {
    display: flex;
    gap: var(--space-xs);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scrollbar-width: thin;
  }

  .leaflet-gallery--carousel {
    scroll-snap-type: x mandatory;
  }

  .leaflet-gallery-item {
    margin: 0;
    min-width: 0;
  }

  .leaflet-gallery--strip .leaflet-gallery-item {
    flex: 0 0 min(18rem, 70vw);
  }

  .leaflet-gallery--carousel .leaflet-gallery-item {
    flex: 0 0 min(34rem, 90%);
    scroll-snap-align: start;
  }

  img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: var(--radius-sm);
  }

  figcaption {
    margin-top: var(--space-2xs);
    color: var(--color-text-600);
    font-size: var(--text-xs);
  }
</style>
