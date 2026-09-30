<script lang="ts">
  import { blueskyPostUrl } from "$lib/utils/bluesky";

  interface RecordView {
    value?: Record<string, unknown>;
  }
  interface Props {
    postRef: { uri: string; cid: string };
    clientHost?: string;
    record?: RecordView;
  }
  let { postRef, clientHost, record }: Props = $props();
  const embedUrl = $derived(blueskyPostUrl(postRef.uri, clientHost));
  const text = $derived(typeof record?.value?.text === "string" ? (record.value.text as string) : undefined);
  const createdAt = $derived(typeof record?.value?.createdAt === "string" ? (record.value.createdAt as string) : undefined);
</script>

<figure class="leaflet-bsky-post">
  {#if text}<blockquote>{text}</blockquote>{/if}
  <figcaption>
    {#if createdAt}
      <time datetime={createdAt}>{new Date(createdAt).toLocaleDateString("en-gb", { year: "numeric", month: "short", day: "2-digit" })}</time>
      <span aria-hidden="true"> · </span>
    {/if}
    <a href={embedUrl} target="_blank" rel="noopener noreferrer">View on Bluesky →</a>
  </figcaption>
</figure>

<style>
  .leaflet-bsky-post {
    margin-block: 1rem;
    border: 1px solid currentColor;
    border-radius: 0;
    padding: 1rem;
  }

  blockquote {
    margin: 0 0 0.75rem;
    white-space: pre-wrap;
  }

  figcaption {
    font-size: 0.85em;
    opacity: 0.8;
  }
</style>
