<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  export let post: any;
  export let title: string = post?.title;
  export let monthIndex: number;
  export let postIndex: number;
  export let localeLoaded: boolean;

  import { formatDate } from "$lib/utils/dateFormatter";

  // Reactive variable to store the display date string
  let displayDate: string;

  // Update displayDate whenever post.createdAt or localeLoaded changes
  $: {
    if (localeLoaded && post?.createdAt) {
      const postDate = new Date(post.createdAt);
      displayDate = formatDate(postDate);
    } else {
      displayDate = "Loading...";
    }
  }
</script>

<div
  class="post-card"
  in:fly={{
    y: 15,
    x: 0,
    delay: 150 + monthIndex * 30 + postIndex * 50,
    duration: 300,
    easing: quintOut,
  }}
>
  <a href={`/blog/${post.rkey}`}>
    <div class="flex flex-col h-[140px] justify-between">
      <p
        class="text-[var(--link-color)] leading-[1.5] pb-2 title-truncate font-medium"
        {title}
      >
        {title}
      </p>
      <div>
        <p class="text-[var(--text-color)] opacity-80 text-sm">Last Updated</p>
        <p class="object-bottom text-[var(--text-color)]">
          {#if localeLoaded && displayDate !== "Loading..."}
            <span transition:fade>{displayDate}</span>
          {:else}
            <span class="opacity-50">Loading...</span>
          {/if}
        </p>
        <p class="text-[var(--text-color)] opacity-80 text-sm mt-1">
          {post.wordCount} words • {Math.ceil(post.wordCount / 200)} min read
        </p>
      </div>
    </div>
  </a>
</div>

<style>
  .post-card {
    backface-visibility: hidden;
  }
</style>
