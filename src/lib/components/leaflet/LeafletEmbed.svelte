<script lang="ts">
  import LoadingSkeleton from "$lib/components/LoadingSkeleton.svelte";
  import { safeResourceUrl } from "$lib/utils/url";

  interface Props {
    url: string;
    height?: number;
    aspectRatio?: { width: number; height: number };
  }
  let { url, height, aspectRatio }: Props = $props();
  const ratio = $derived(
    aspectRatio && aspectRatio.width > 0 && aspectRatio.height > 0
      ? `${aspectRatio.width} / ${aspectRatio.height}`
      : "16 / 9",
  );
  const embedSrc = $derived(safeResourceUrl(url));

  let loaded = $state(false);

  function handleLoad(event: Event) {
    (event.currentTarget as HTMLIFrameElement).classList.add("is-loaded");
    loaded = true;
  }
</script>

{#if embedSrc}
  <div class="leaflet-embed" aria-busy={!loaded}>
    <div class="leaflet-embed-loading" class:is-loaded={loaded} aria-hidden={loaded}>
      <LoadingSkeleton count={3} label="Loading embedded content" />
    </div>
    <iframe
      src={embedSrc}
      {height}
      style={`aspect-ratio: ${ratio}`}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups"
      title="Embedded content"
      class:is-loaded={loaded}
      onload={handleLoad}
    ></iframe>
  </div>
{/if}
