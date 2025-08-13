<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { ArchiveCard } from "$components/archive";
  import type { Post } from "$components/shared";

  export let posts: Post[] = [];
  export let localeLoaded: boolean = false;
  
  // Add loading state
  let isVisible = false;

  // Get the latest post with proper validation
  $: latestPost = posts && posts.length > 0 ? posts[0] : null;
  
  // Additional validation to ensure the post has valid data
  $: isValidPost = latestPost && 
    latestPost.title && 
    latestPost.createdAt instanceof Date && 
    !isNaN(latestPost.createdAt.getTime()) &&
    latestPost.content;

  // Use the postNumber from the latestPost object
  $: postNumber = latestPost ? latestPost.postNumber : null;
  
  // Control visibility with a small delay for smoother loading
  $: if (isValidPost && localeLoaded) {
    setTimeout(() => {
      isVisible = true;
    }, 200);
  }
</script>

{#if isValidPost && isVisible}
  <section 
    class="latest-blog-post"
    in:slide={{ delay: 200, duration: 400, easing: quintOut }}
  >
    <div class="section-header" transition:fade={{ delay: 100, duration: 300 }}>
      <h2 class="section-title">Latest Blog Post</h2>
    </div>
    
    <div class="latest-post-container" transition:fade={{ delay: 300, duration: 400 }}>
      <ArchiveCard 
        type="post" 
        post={latestPost} 
        monthIndex={0}
        postIndex={0}
        postNumber={postNumber}
        {localeLoaded} 
      />
    </div>
  </section>
{:else if posts.length === 0 && localeLoaded}
  <!-- Show loading state while posts are being fetched -->
  <section class="latest-blog-post">
    <div class="section-header">
      <h2 class="section-title">Latest Blog Post</h2>
    </div>
    <div class="loading-container">
      <div class="loading-placeholder">
        <div class="animate-pulse">
          <div class="h-4 bg-card rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-card rounded w-1/2"></div>
        </div>
      </div>
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
    display: grid;
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .loading-container {
    max-width: 400px;
  }

  .loading-placeholder {
    padding: 1rem;
    border: 1px solid var(--button-bg);
    border-radius: 0.5rem;
    background-color: var(--card-bg);
  }

  /* Responsive adjustments */
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

  @media (min-width: 768px) {
    .latest-post-container, .loading-container {
      max-width: 420px;
    }
  }

  /* Animation for loading states */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>