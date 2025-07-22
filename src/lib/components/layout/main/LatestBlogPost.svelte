<script lang="ts">
  import { slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { ArchiveCard } from "$lib/components/archive";
  import type { Post } from "$lib/components/shared";

  export let posts: Post[] = [];
  export let localeLoaded: boolean = false;

  // Get the latest post with proper validation
  $: latestPost = posts && posts.length > 0 ? posts[0] : null;
  
  // Additional validation to ensure the post has valid data
  $: isValidPost = latestPost && 
    latestPost.title && 
    latestPost.createdAt instanceof Date && 
    !isNaN(latestPost.createdAt.getTime()) &&
    latestPost.content;
</script>

{#if isValidPost}
  <section 
    class="latest-blog-post"
    in:slide={{ delay: 200, duration: 400, easing: quintOut }}
  >
    <div class="section-header">
      <h2 class="section-title">Latest Blog Post</h2>
    </div>
    
    <div class="latest-post-container">
      <ArchiveCard 
        type="post" 
        post={latestPost} 
        monthIndex={0}
        postIndex={0}
        {localeLoaded} 
      />
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
    .latest-post-container {
      max-width: 420px;
    }
  }
</style>