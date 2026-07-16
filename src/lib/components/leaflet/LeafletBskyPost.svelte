<script lang="ts">
  import { blueskyPostUrl } from "$lib/utils/bluesky";

  /**
   * LeafletBskyPost — rendered Bluesky post embed from a Leaflet document.
   * Converts the at:// URI into a bsky.app profile/post URL and links
   * to it. Uses the configured clientHost to support custom PDS
   * front-ends.
   */
  let { postRef, clientHost }: {
    postRef: { uri: string; cid: string };
    clientHost?: string;
  } = $props();

  let embedUrl = $derived(blueskyPostUrl(postRef.uri, clientHost));
</script>

<div class="leaflet-bsky-post">
  <a href={embedUrl} target="_blank" rel="noopener" class="bsky-post-link">
    Bluesky post &rarr;
  </a>
</div>
