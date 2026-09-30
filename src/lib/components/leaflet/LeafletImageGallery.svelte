<script lang="ts">
  import { safeResourceUrl } from "$lib/utils/url";

  type Obj = Record<string, unknown>;
  interface Props {
    images: Obj[];
    format?: string;
    gap?: number;
    maxWidth?: number;
  }
  let { images, format = "grid", gap, maxWidth }: Props = $props();

  const px = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : undefined);
  const gapPx = $derived(px(gap));
  const maxWidthPx = $derived(px(maxWidth));
  // Leaflet's per-image max width drives how many grid columns fit.
  const style = $derived(
    [gapPx !== undefined && `--leaflet-gallery-gap:${gapPx}px`, maxWidthPx && `--leaflet-gallery-col:${maxWidthPx}px`]
      .filter(Boolean)
      .join(";") || undefined,
  );

  function aspectRatio(image: Obj): string | undefined {
    const ratio = image.aspectRatio;
    if (!ratio || typeof ratio !== "object") return undefined;
    const { width, height } = ratio as { width?: number; height?: number };
    return width && height && width > 0 && height > 0 ? `${width} / ${height}` : undefined;
  }
  const mode = $derived(format === "carousel" || format === "strip" ? format : "grid");
</script>

<div class={`leaflet-gallery leaflet-gallery--${mode}`} {style} aria-label="Image gallery">
  {#each images as image, i (i)}
    {@const src = safeResourceUrl(image._imageSrc as string | undefined)}
    {@const ratio = aspectRatio(image)}
    {#if src}
      <figure class="leaflet-gallery-item">
        <img {src} alt={(image.alt as string | undefined) ?? ""} style={ratio ? `aspect-ratio: ${ratio}` : undefined} loading="lazy" decoding="async" />
        {#if image.alt}<figcaption>{image.alt as string}</figcaption>{/if}
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
    grid-template-columns: repeat(auto-fit, minmax(min(var(--leaflet-gallery-col, 12rem), 100%), 1fr));
    gap: var(--leaflet-gallery-gap, var(--space-xs));
  }

  .leaflet-gallery--strip,
  .leaflet-gallery--carousel {
    display: flex;
    gap: var(--leaflet-gallery-gap, var(--space-xs));
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
