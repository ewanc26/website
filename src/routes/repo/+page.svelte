<script lang="ts">
  import RepoVisualizer from "$lib/components/RepoVisualizer.svelte";
  import SeoHead from "$lib/components/SeoHead.svelte";
  import Slab from "$lib/components/Slab.svelte";

  let { data } = $props();
</script>

<SeoHead
  title="Repository Visualizer"
  description="Live visualization of AT Protocol repository events and activity"
  ogSubtitle="Live repository activity"
  ogType="TOOL"
  siteInfo={data.siteInfo}
/>

<main class="wrap">
  <Slab word="Repository" />
  
  <div class="cols">
    <div>
      <h1>Live Repository Activity</h1>
      <p class="lede">
        Watch your AT Protocol repository come to life with this interactive visualizer.
        See posts, likes, reposts, comments, and more as they happen.
      </p>
    </div>
  </div>

  <RepoVisualizer />

  <div class="cols">
    <div>
      <h2>How it works</h2>
      <p>
        This visualizer connects to your AT Protocol repository and fetches recent events
        from multiple collections including posts, likes, reposts, follows, and comments.
        Each event appears as a colored particle that animates across the canvas.
      </p>
      <p>
        The visualization updates automatically every 30 seconds, or you can manually refresh
        to see the latest activity. The event list at the bottom shows the most recent events
        with their types and timestamps.
      </p>
    </div>
  </div>
</main>
