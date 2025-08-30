<script lang="ts">
  import type { Post } from "$components/shared";
  import { fade } from "svelte/transition";

  let { adjacentPosts }: {
    adjacentPosts: { previous: Post | null; next: Post | null }
  } = $props();

  let hasPrevious = $derived(
    !!adjacentPosts?.previous?.title && !!adjacentPosts?.previous?.rkey
  );
  let hasNext = $derived(
    !!adjacentPosts?.next?.title && !!adjacentPosts?.next?.rkey
  );
  let showNavigation = $derived(adjacentPosts !== undefined);
</script>

{#if showNavigation}
  <div class="flex justify-between mt-8 mb-8 gap-4" transition:fade={{ duration: 300 }}>
    {#if hasPrevious && adjacentPosts.previous}
    <div class="flex flex-col max-w-[45%]">
      <div class="text-sm text-mono mb-1 lowercase">Next</div>
      <a
        href="/blog/{adjacentPosts.previous.rkey}"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)] truncate group transition-all duration-200"
        title={adjacentPosts.previous.title}
      >
        {adjacentPosts.previous.title}
      </a>
    </div>
    {:else}
      <div class="max-w-[45%]"></div>
    {/if}

    {#if hasNext && adjacentPosts.next}
    <div class="flex flex-col max-w-[45%] text-right">
      <div class="text-sm text-mono mb-1 lowercase">Previous</div>
      <a
        href="/blog/{adjacentPosts.next.rkey}"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)] truncate group transition-all duration-200"
        title={adjacentPosts.next.title}
      >
        {adjacentPosts.next.title}
      </a>
    </div>
    {:else}
      <div class="max-w-[45%]"></div>
    {/if}
  </div>
{:else}
  <!-- Loading skeletons -->
  <div class="flex justify-between mt-8 mb-8 gap-4">
    <div class="max-w-[45%] opacity-50">
      <div class="animate-pulse h-5 bg-card rounded w-32"></div>
    </div>
    <div class="max-w-[45%] opacity-50">
      <div class="animate-pulse h-5 bg-card rounded w-32 ml-auto"></div>
    </div>
  </div>
{/if}

<style>
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>