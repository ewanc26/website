<script lang="ts">
  import { slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { ArchiveCard } from "$lib/components/archive";
  import type { Post } from "$lib/components/shared";
  import { ArrowRightUpIcon } from "$lib/components/icons";

  export let posts: Post[] = [];
  export let localeLoaded: boolean = false;

  // Get the latest post (posts should already be sorted by createdAt descending)
  $: latestPost = posts && posts.length > 0 ? posts[0] : null;
</script>

{#if latestPost}
  <section 
    class="latest-blog-post"
    in:slide={{ delay: 200, duration: 400, easing: quintOut }}
  >
    <div class="section-header">
      <h2 class="section-title">Latest Blog Post</h2>
      <a href="/blog" class="view-all-link">
        View All Posts
        <ArrowRightUpIcon size="16" />
      </a>
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
    padding: 0 0.5rem;
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

  .view-all-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--link-color);
    text-decoration: none;
    border: 1px solid transparent;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    background: rgba(var(--link-color-rgb, 59, 130, 246), 0.1);
  }

  .view-all-link:hover {
    color: var(--link-hover-color);
    background: rgba(var(--link-color-rgb, 59, 130, 246), 0.15);
    transform: translateY(-1px);
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

    .view-all-link {
      align-self: flex-end;
      font-size: 0.85rem;
      padding: 0.4rem 0.8rem;
    }
  }

  @media (min-width: 768px) {
    .latest-post-container {
      max-width: 420px;
    }
  }
</style>