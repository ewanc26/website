<script lang="ts">
  /**
   * Render a Leaflet Bluesky post embed block.
   * Uses the Bluesky embed URL for a lightweight embed.
   */

  let { postRef, clientHost }: {
    postRef: { uri: string; cid: string };
    clientHost?: string;
  } = $props();

  const BSKY_HOST = "bsky.app";

  function getEmbedUrl(): string {
    const host = clientHost?.replace(/\/$/, "") || `https://${BSKY_HOST}`;
    // at-uri: at://did:.../app.bsky.feed.post/rkey
    const parts = postRef.uri.replace("at://", "").split("/");
    const did = parts[0];
    const rkey = parts[parts.length - 1];
    return `${host}/profile/${did}/post/${rkey}`;
  }

  let embedUrl = $derived(getEmbedUrl());
</script>

<div class="leaflet-bsky-post">
  <a href={embedUrl} target="_blank" rel="noopener" class="bsky-post-link">
    Bluesky post &rarr;
  </a>
</div>
