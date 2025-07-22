<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import MonthSection from "./MonthSection.svelte";
  import { calculateTotalReadTime, calculateTotalWordCount, formatReadTime } from "$utils/tally";
  import StatsDisplay from "./StatsDisplay.svelte";

  export const year: number = 0;
  export let months: Record<string, any[]>;
  export let localeLoaded: boolean;

  // Calculate yearly totals
  $: rawYearlyTotalReadTime = Object.values(months).reduce((total, postsInMonth) => {
    return total + calculateTotalReadTime(postsInMonth);
  }, 0);
  $: yearlyTotalReadTime = formatReadTime(rawYearlyTotalReadTime);

  $: yearlyTotalWordCount = Object.values(months).reduce((total, postsInMonth) => {
    return total + calculateTotalWordCount(postsInMonth);
  }, 0);
</script>

<div
  in:fly={{ y: 20, duration: 300, delay: 50, easing: quintOut }}
  out:fade={{ duration: 200 }}
  class="year-content"
>
  <StatsDisplay totalReadTime={yearlyTotalReadTime} totalWordCount={yearlyTotalWordCount} />

  {#each Object.entries(months) as [monthName, postsInMonth], monthIndex}
    <MonthSection
      {monthName}
      {postsInMonth}
      {monthIndex}
      {localeLoaded}

    />
  {/each}
</div>