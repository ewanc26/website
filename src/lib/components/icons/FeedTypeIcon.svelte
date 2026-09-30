<script lang="ts">
  import { Images, ExternalLink, Video, Quote } from "@lucide/svelte";

  interface Props {
    kind: "text" | "images" | "external" | "video" | "quote" | "quote-media";
  }
  let { kind }: Props = $props();
</script>

{#if kind === "images"}
  <Images class="ui-icon feed-type-icon" aria-hidden="true" />
{:else if kind === "external"}
  <ExternalLink class="ui-icon feed-type-icon" aria-hidden="true" />
{:else if kind === "video"}
  <Video class="ui-icon feed-type-icon" aria-hidden="true" />
{:else if kind === "quote" || kind === "quote-media"}
  <Quote class="ui-icon feed-type-icon" aria-hidden="true" />
{/if}
