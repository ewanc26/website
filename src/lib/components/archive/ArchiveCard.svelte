<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { formatDate } from "$lib/utils/dateFormatter";

  export let type: 'post' | 'link';
  export let post: any = {}; // For post type
  export let title: string = ""; // For link type or post title
  export let url: string = ""; // For link type
  export let value: string = ""; // For link type
  export let monthIndex: number = 0;
  export let postIndex: number = 0;
  export let localeLoaded: boolean = false;

  // Reactive variable to store the display date string for posts
  let displayDate: string;

  // Update displayDate whenever post.createdAt or localeLoaded changes for posts
  $: {
    if (type === 'post' && localeLoaded && post?.createdAt) {
      const postDate = new Date(post.createdAt);
      displayDate = formatDate(postDate);
    } else if (type === 'post') {
      displayDate = "Loading...";
    }
  }

  // Determine the title to display based on type
  $: displayTitle = type === 'post' ? post?.title : title;
  $: href = type === 'post' ? `/blog/${post.rkey}` : url;
  $: cardHeight = type === 'post' ? 'h-[140px]' : 'h-[110px]';
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
  <a {href}>
    <div class="flex flex-col {cardHeight} justify-between">
      <p
        class="text-[var(--link-color)] leading-[1.5] pb-2 font-medium overflow-hidden"
        title={displayTitle}
        style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; word-break: break-word;"
      >
        {displayTitle}
      </p>
      <div>
        {#if type === 'post'}
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
        {:else if type === 'link'}
          <p class="text-[var(--text-color)] text-sm">{value}</p>
          <p class="object-bottom text-[var(--text-color)] text-sm">
            {url?.replace(/^https?:\/\//, "").split("/")[0]}
          </p>
        {/if}
      </div>
    </div>
  </a>
</div>

<style>
  .post-card {
    backface-visibility: hidden;
  }
</style>