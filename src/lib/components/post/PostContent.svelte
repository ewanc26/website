<script lang="ts">
  import type { Post } from "$components/shared";

  export let post: Post;

  // Validate that post content exists and is safe to render
  $: hasValidContent = post && post.content && typeof post.content === 'string' && post.content.trim().length > 0;
</script>

{#if hasValidContent}
  <hr class="my-6 border-[var(--button-bg)]" />
  <article class="prose dark:prose-invert mx-auto text-center">
    {@html post.content}
  </article>
  <hr class="my-6 border-[var(--button-bg)]" />
{:else}
  <!-- Loading state for content -->
  <hr class="my-6 border-[var(--button-bg)]" />
  <article class="prose dark:prose-invert mx-auto text-center">
    <div class="flex justify-center items-center min-h-[200px]">
      <div class="text-center">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-card rounded w-3/4 mx-auto"></div>
          <div class="h-4 bg-card rounded w-1/2 mx-auto"></div>
          <div class="h-4 bg-card rounded w-5/6 mx-auto"></div>
          <div class="h-4 bg-card rounded w-2/3 mx-auto"></div>
        </div>
        <p class="mt-6 text-sm opacity-60">Loading post content...</p>
      </div>
    </div>
  </article>
  <hr class="my-6 border-[var(--button-bg)]" />
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

  .animate-pulse .h-4 {
    height: 1rem;
    background-color: var(--button-bg);
    opacity: 0.6;
  }
</style>