<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { DynamicLinks, LatestBlogPost } from "$components/layout/main";

  let { data } = $props();

  // State management with proper typing
  let localeLoaded = $state(false);

  onMount(() => {
    setTimeout(() => {
      localeLoaded = true;
    }, 100);
  });
</script>

<svelte:head>
  <title>Ewan's Corner</title>
  <meta
    name="description"
    content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life."
  />
  <meta
    name="keywords"
    content="Ewan, personal website, coding, technology, programming, tech blog, Ewan's Corner"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.origin + $page.url.pathname} />
  <meta property="og:title" content="Ewan's Corner" />
  <meta
    property="og:description"
    content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life."
  />
  <meta property="og:site_name" content="Ewan's Corner" />
  <meta property="og:image" content={`${$page.url.origin}/og/main.png`} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
  <meta name="twitter:title" content="Ewan's Corner" />
  <meta
    name="twitter:description"
    content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life."
  />
  <meta name="twitter:image" content={`${$page.url.origin}/og/main.png`} />
</svelte:head>

<!-- Latest Blog Posts - SSR data -->
{#if data.latestPosts && data.latestPosts.length > 0}
  <LatestBlogPost posts={data.latestPosts} {localeLoaded} />
{:else}
  <div class="text-center py-8">
    No blog posts available
  </div>
{/if}

<!-- Dynamic Links - Streamed data with proper Promise handling -->
{#if data.streamed?.links}
  {#await data.streamed.links}
    <div class="text-center py-4 animate-pulse text-sm opacity-50">
      Loading links...
    </div>
  {:then linkData}
    {#if linkData}
      <DynamicLinks data={linkData} />
    {:else}
      <div class="text-center py-4 text-sm opacity-50">
        No links available
      </div>
    {/if}
  {:catch error}
    <div class="text-center py-4 text-sm opacity-50">
      Failed to load links
    </div>
  {/await}
{/if}
