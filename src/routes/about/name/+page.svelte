<script lang="ts">
  import SeoHead from "$lib/components/SeoHead.svelte";
  import Slab from "$lib/components/Slab.svelte";
  import TableOfContents from "$lib/components/TableOfContents.svelte";
  import LeafletBlocks from "$lib/components/leaflet/LeafletBlocks.svelte";

  let { data } = $props();
  const { post, meta, blocks, html } = $derived(data);
</script>

<SeoHead title={post.title} description={meta} ogSubtitle={post.description} ogType="ABOUT" siteInfo={data.siteInfo} />

<main class="wrap">
  <p class="pix"><a href="/about">← About</a></p>
  <Slab word="My Name" long />
  {#if post.description}<p class="post-deck">{post.description}</p>{/if}
  <div class="article">
    <aside class="rail"><TableOfContents container=".prose" /></aside>
    <div>
      <article class="prose">
        {#if blocks.length > 0}
          <LeafletBlocks {blocks} />
        {:else}
          {@html html}
        {/if}
      </article>
      <p class="post-end" aria-hidden="true">◆ ◆ ◆</p>
    </div>
  </div>
</main>
