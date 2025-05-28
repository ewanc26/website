<script lang="ts">
  import { slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import PostCard from "./PostCard.svelte";

  export let monthName: string;
  export let postsInMonth: any[];
  export let monthIndex: number;
  export let localeLoaded: boolean;
  export let totalReadTime: number = 0;
  export let totalWordCount: number = 0;

  // Calculate the number of posts
  let postCount = postsInMonth.length;
  let postLabel = postCount === 1 ? "post" : "posts";

  // Determine singular or plural for word count
  let wordLabel = totalWordCount === 1 ? "word" : "words";
</script>

<div
  class="mb-12 ml-4"
  in:slide={{ delay: 100 + monthIndex * 50, duration: 300, easing: quintOut }}
>
  <h2 class="text-2xl font-bold mb-1 ml-2">{monthName}</h2>
  <p class="text-sm opacity-50 mb-4 ml-2">
    {totalReadTime} min read time • {totalWordCount}
    {wordLabel} • {postCount}
    {postLabel}
  </p>
  <div
    class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr)_)] gap-x-6 gap-y-8 mx-4 my-8"
  >
    {#each postsInMonth as post, postIndex (post.rkey)}
      <PostCard {post} {monthIndex} {postIndex} {localeLoaded} />
    {/each}
  </div>
</div>
