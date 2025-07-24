<script lang="ts">
  import { slide } from "svelte/transition";

  import { quintOut } from "svelte/easing";
  import { ArchiveCard } from "./index";
  import StatsDisplay from "./StatsDisplay.svelte";

  export let monthName: string;
  export let postsInMonth: any[];
  export let monthIndex: number;
  export let localeLoaded: boolean;
  import { calculateTotalReadTime, calculateTotalWordCount, formatReadTime } from "$utils/tally";

  $: rawTotalReadTime = calculateTotalReadTime(postsInMonth);
  $: totalReadTime = formatReadTime(rawTotalReadTime);
  $: totalWordCount = calculateTotalWordCount(postsInMonth);

  // Calculate the number of posts
  let postCount = postsInMonth.length;
</script>

<div
  class="mb-12 ml-4"
  in:slide={{ delay: 100 + monthIndex * 50, duration: 300, easing: quintOut }}
>
  <h2 class="text-2xl font-bold mb-1 ml-2">{monthName}</h2>
  <StatsDisplay {totalReadTime} {totalWordCount} {postCount} />
  <div
    class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr)_)] gap-x-6 gap-y-6 mx-4 my-8"
  >
    {#each postsInMonth as post, postIndex (post.rkey)}
      <ArchiveCard type="post" {post} {monthIndex} {postIndex} {localeLoaded} postNumber={post.postNumber} />
    {/each}
  </div>
</div>
