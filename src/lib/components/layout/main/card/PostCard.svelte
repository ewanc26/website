<script lang="ts">
  import { onMount } from 'svelte';
  import { LinkCard } from '$lib/components/layout/main/card';
  import { fetchBlogPosts, type BlogPostsData } from '$lib/services/atproto';
  import { formatRelativeTime } from '$lib/utils/formatDate';

  let blogPosts: BlogPostsData | null = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      blogPosts = await fetchBlogPosts();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load blog posts';
    } finally {
      loading = false;
    }
  });

  function getPlatformColor(platform: 'whitewind' | 'leaflet') {
    return platform === 'whitewind' ? 'mint' : 'sage';
  }

  function getPlatformName(platform: 'whitewind' | 'leaflet') {
    return platform === 'whitewind' ? 'Whitewind' : 'Leaflet';
  }
</script>

<div class="mx-auto w-full max-w-2xl">
  {#if loading}
    <div class="animate-pulse rounded-xl bg-canvas-200 p-6 shadow-md dark:bg-canvas-800">
      <div class="mb-4 h-6 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
      <div class="space-y-4">
        {#each Array(5) as _}
          <div class="space-y-2">
            <div class="h-5 w-3/4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
            <div class="h-4 w-full rounded bg-canvas-300 dark:bg-canvas-700"></div>
            <div class="h-3 w-24 rounded bg-canvas-300 dark:bg-canvas-700"></div>
          </div>
        {/each}
      </div>
    </div>
  {:else if error}
    <div class="rounded-xl bg-red-50 p-6 text-center shadow-md dark:bg-red-900/20">
      <p class="text-red-600 dark:text-red-400">{error}</p>
    </div>
  {:else if blogPosts && blogPosts.posts.length > 0}
    <div class="rounded-xl bg-canvas-100 p-6 shadow-lg dark:bg-canvas-900">
      <h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Recent Posts</h2>
      <div class="space-y-3">
        {#each blogPosts.posts as post}
          <LinkCard
            url={post.url}
            title={post.title}
            description={post.description}
            badges={[{ text: getPlatformName(post.platform), color: getPlatformColor(post.platform) }]}
            meta={formatRelativeTime(post.createdAt)}
          />
        {/each}
      </div>
    </div>
  {:else}
    <div class="rounded-xl bg-canvas-100 p-12 text-center shadow-lg dark:bg-canvas-900">
      <p class="text-ink-700 dark:text-ink-300">
        No blog posts available. Write on
        <a href="https://whtwnd.com/" class="text-sage-600 hover:underline dark:text-sage-400">Whitewind</a>
        or
        <a href="https://leaflet.pub/" class="text-sage-600 hover:underline dark:text-sage-400">Leaflet</a>
        to get started!
      </p>
    </div>
  {/if}
</div>
