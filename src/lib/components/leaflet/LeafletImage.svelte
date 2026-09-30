<script lang="ts">
  import { safeResourceUrl } from "$lib/utils/url";

  interface Props {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    fullBleed?: boolean;
    /** Leaflet's display width in px, capped at the page width. Ignored when full-bleed. */
    displayWidth?: number;
  }
  let { src, alt, width, height, fullBleed, displayWidth }: Props = $props();

  const aspectRatio = $derived(width && height && width > 0 && height > 0 ? `${width} / ${height}` : undefined);
  const sized = $derived(
    !fullBleed && typeof displayWidth === "number" && Number.isFinite(displayWidth) && displayWidth > 0
      ? `width:${Math.round(displayWidth)}px;max-width:100%;height:auto`
      : undefined,
  );
  const imgStyle = $derived([aspectRatio && `aspect-ratio: ${aspectRatio}`, sized].filter(Boolean).join(";") || undefined);
  const imageSrc = $derived(safeResourceUrl(src));
</script>

{#if imageSrc}
  <figure class="leaflet-image" class:full-bleed={fullBleed} class:leaflet-image--unsized={!aspectRatio}>
    <img src={imageSrc} alt={alt ?? ""} {width} {height} style={imgStyle} loading="lazy" decoding="async" />
    {#if alt}<figcaption class="leaflet-image-alt">{alt}</figcaption>{/if}
  </figure>
{/if}

<style>
  .leaflet-image--unsized img {
    min-height: 12rem;
    background: var(--paper-deep);
  }
</style>
