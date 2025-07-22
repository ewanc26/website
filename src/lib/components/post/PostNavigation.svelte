<script lang="ts">
  import type { Post } from "$components/shared";

  export let adjacentPosts: {
    previous: Post | null;
    next: Post | null;
  };
</script>

<div class="flex justify-between mt-8 mb-8 gap-4">
  {#if adjacentPosts.previous}
    <a
      href="/blog/{adjacentPosts.previous.rkey}"
      class="text-[var(--link-color)] hover:text-[var(--link-hover-color)] max-w-[45%] truncate"
      title={adjacentPosts.previous.title}
    >
      ← {adjacentPosts.previous.title}
    </a>
  {:else}
    <span></span>
  {/if}

  {#if adjacentPosts.next}
    <a
      href="/blog/{adjacentPosts.next.rkey}"
      class="text-[var(--link-color)] hover:text-[var(--link-hover-color)] max-w-[45%] truncate"
      title={adjacentPosts.next.title}
    >
      {adjacentPosts.next.title} →
    </a>
  {:else}
    <span></span>
  {/if}
</div>
