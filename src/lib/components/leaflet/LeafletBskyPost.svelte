<script lang="ts">
  import { blueskyPostUrl } from "$lib/utils/bluesky";

  interface RecordView {
    value?: Record<string, unknown>;
  }

  /**
   * Render the public text of a referenced Bluesky post when the server could
   * hydrate it, while retaining a stable client link as the interaction path.
   */
  let {
    postRef,
    clientHost,
    record,
  }: {
    postRef: { uri: string; cid: string };
    clientHost?: string;
    record?: RecordView;
  } = $props();

  let embedUrl = $derived(blueskyPostUrl(postRef.uri, clientHost));
  let text = $derived(
    typeof record?.value?.text === "string" ? record.value.text : undefined,
  );
  let createdAt = $derived(
    typeof record?.value?.createdAt === "string"
      ? record.value.createdAt
      : undefined,
  );
</script>

<figure class="leaflet-bsky-post">
  {#if text}
    <blockquote>{text}</blockquote>
  {/if}
  <figcaption>
    {#if createdAt}
      <time datetime={createdAt}>
        {new Date(createdAt).toLocaleDateString("en-gb", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </time>
      <span aria-hidden="true"> · </span>
    {/if}
    <a href={embedUrl} target="_blank" rel="noopener noreferrer">
      View on Bluesky →
    </a>
  </figcaption>
</figure>

<style>
  .leaflet-bsky-post {
    margin-block: 1rem;
    border: 1px solid currentColor;
    border-radius: 0.5rem;
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
