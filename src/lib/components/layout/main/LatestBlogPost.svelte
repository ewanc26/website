<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { ArchiveCard } from "$components/archive";
  import type { Post } from "$components/shared";

  export let posts: Post[] = [];
  export let localeLoaded: boolean = false;

  let isVisible = false;

  // Get the first three latest posts with proper validation
  $: latestPosts = posts
    ? posts
        .filter(post =>
          post.title &&
          post.createdAt instanceof Date &&
          !isNaN(post.createdAt.getTime()) &&
          post.content
        )
        .slice(0, 3)
    : [];

  $: isValidPosts = latestPosts.length > 0;

  // Control visibility with a small delay for smoother loading
  $: if (isValidPosts && localeLoaded) {
    setTimeout(() => {
      isVisible = true;
    }, 200);
  }
</script>

{#if isValidPosts && isVisible}
  <section 
    class="latest-blog-post"
    in:slide={{ delay: 200, duration: 400, easing: quintOut }}
  >
    <div class="section-header" in:fade={{ delay: 100, duration: 300 }}>
      <h2 class="section-title">Latest Blog Posts</h2>
    </div>

    <div class="latest-post-container grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-6 gap-y-6 my-6">
      {#each latestPosts as post, index}
        <!-- Outer div handles slide -->
        <div in:slide={{ delay: 200 + index * 150, duration: 400, easing: quintOut }}>
          <!-- Inner div handles fade -->
          <div in:fade={{ delay: 200 + index * 150, duration: 400 }}>
            <ArchiveCard 
              type="post" 
              post={post} 
              monthIndex={0} 
              postIndex={index} 
              postNumber={post.postNumber} 
              {localeLoaded} 
            />
          </div>
        </div>
      {/each}
    </div>
  </section>
{:else if posts.length === 0 && localeLoaded}
  <!-- Loading state while posts are being fetched -->
  <section class="latest-blog-post">
    <div class="section-header">
      <h2 class="section-title">Latest Blog Posts</h2>
    </div>
    <div class="latest-post-container grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-6 gap-y-6 my-6">
      {#each Array(3) as _, index}
        <div class="loading-placeholder">
          <div class="animate-pulse">
            <div class="h-4 bg-card rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-card rounded w-1/2"></div>
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}

<style>
  .latest-blog-post {
    margin-bottom: 3rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding: 0;
  }

  .section-title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    position: relative;
  }

  .section-title::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 3rem;
    height: 3px;
    background: var(--link-color);
    border-radius: 2px;
  }

  .latest-post-container {
    max-width: 100%;
  }

  .loading-placeholder {
    padding: 1rem;
    border: 1px solid var(--button-bg);
    border-radius: 0.5rem;
    background-color: var(--card-bg);
  }

  @media (max-width: 640px) {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .section-title {
      font-size: 1.5rem;
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>