<script lang="ts" module>
  declare global {
    interface Window {
      $page: {
        url: URL;
      };
    }
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import type { Post } from "$components/shared";
  import {
    PostHead,
    PostHeader,
    PostContent,
    PostNavigation,
  } from "$components/post";
  import { NotFoundMessage } from "$components/shared";

  let { data }: { data: any } = $props();
  
  // Derive state from props with correct typing
  let post: Post | undefined = $derived(data?.post);
  let adjacentPosts = $derived(data?.adjacentPosts || { previous: null, next: null });
  let profile = $derived(data?.profile);
  let rkey = $derived(data?.rkey || '');

  // State for loading
  let localeLoaded = $state(false);
  let contentReady = $state(false);

  // Validations as derived values (no legacy `$:`)
  let isValidPost = $derived(
    !!post &&
    !!post.title &&
    !!post.rkey &&
    post.createdAt instanceof Date &&
    !isNaN(post.createdAt.getTime()) &&
    !!post.content
  );

  let hasProfile = $derived(
    !!profile?.displayName && !!profile?.handle
  );

  onMount(() => {
    localeLoaded = true;
    setTimeout(() => {
      contentReady = true;
    }, 100);
  });
</script>

{#if post}
  <PostHead {post} />
{/if}

{#if isValidPost && contentReady}
  <div class="max-w-4xl mx-auto px-4">
    {#if post}
      <PostHeader
        {post}
        {profile}
        {rkey}
        {localeLoaded}
      />
      <PostContent {post} />
    {/if}
    <PostNavigation {adjacentPosts} />
  </div>
{:else if data?.post === undefined && contentReady}
  <!-- Post not found -->
  <NotFoundMessage />
{:else if !contentReady || !localeLoaded}
  <!-- Loading state -->
  <div class="max-w-4xl mx-auto px-4">
    <div class="text-center my-12 space-y-6">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-card rounded w-3/4 mx-auto"></div>
        <div class="h-4 bg-card rounded w-1/2 mx-auto"></div>
        <div class="h-4 bg-card rounded w-1/3 mx-auto"></div>
      </div>
      <p class="text-sm opacity-60">Loading post...</p>
    </div>
    
    <hr class="my-6 border-[var(--button-bg)]" />
    
    <div class="text-center my-8">
      <div class="animate-pulse space-y-4">
        <div class="h-4 bg-card rounded w-full"></div>
        <div class="h-4 bg-card rounded w-5/6 mx-auto"></div>
        <div class="h-4 bg-card rounded w-4/5 mx-auto"></div>
        <div class="h-4 bg-card rounded w-3/4 mx-auto"></div>
      </div>
    </div>
    
    <hr class="my-6 border-[var(--button-bg)]" />
  </div>
{:else}
  <!-- Error state -->
  <div class="max-w-4xl mx-auto px-4 text-center my-12">
    <h1 class="text-2xl font-bold mb-4">Error Loading Post</h1>
    <p class="opacity-70">The post data appears to be incomplete or corrupted.</p>
    <p class="text-sm opacity-50 mt-2">
      Try refreshing the page or check the post URL.
    </p>
  </div>
{/if}

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-pulse .h-4,
  .animate-pulse .h-8 {
    background-color: var(--button-bg);
    opacity: 0.6;
  }

  .animate-pulse .h-4 {
    height: 1rem;
  }

  .animate-pulse .h-8 {
    height: 2rem;
  }
</style>
