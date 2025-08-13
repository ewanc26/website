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
      <a
        href="/blog/{adjacentPosts.previous.rkey}"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)] max-w-[45%] group transition-all duration-200"
        title={adjacentPosts.previous.title}
      >
        <span class="group-hover:mr-1 transition-all duration-200">←</span>
        <span class="truncate inline-block align-bottom max-w-[calc(100%-1.5rem)]">
          {adjacentPosts.previous.title}
        </span>
      </a>
    {:else}
      <div class="max-w-[45%]"></div>
    {/if}

    {#if hasNext && adjacentPosts.next}
      <a
        href="/blog/{adjacentPosts.next.rkey}"
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)] max-w-[45%] text-right group transition-all duration-200"
        title={adjacentPosts.next.title}
      >
        <span class="truncate inline-block align-bottom max-w-[calc(100%-1.5rem)]">
          {adjacentPosts.next.title}
        </span>
        <span class="group-hover:ml-1 transition-all duration-200">→</span>
      </a>
    {:else}
      <div class="max-w-[45%]"></div>
    {/if}
  </div>
{:else}
  <!-- Loading state for navigation -->
  <div class="flex justify-between mt-8 mb-8 gap-4">
    <div class="max-w-[45%] opacity-50">
      <div class="animate-pulse">
        <div class="h-5 bg-card rounded w-32"></div>
      </div>
    </div>
    <div class="max-w-[45%] opacity-50">
      <div class="animate-pulse">
        <div class="h-5 bg-card rounded w-32 ml-auto"></div>
      </div>
    </div>
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

  .animate-pulse .h-5 {
    height: 1.25rem;
    background-color: var(--button-bg);
    opacity: 0.4;
  }

  .group:hover span {
    transition: all 0.2s ease-in-out;
  }
</style>
