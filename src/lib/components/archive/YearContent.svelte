<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import MonthSection from './MonthSection.svelte';
  
  export const year: number = 0;
  export let months: Record<string, any[]>;
  export let localeLoaded: boolean;
  export let formatDate: (date: Date) => string;
  
  // Calculate total read time for each month
  function calculateTotalReadTime(posts: any[]): number {
    return posts.reduce((total, post) => {
      return total + Math.ceil(post.wordCount / 200);
    }, 0);
  }
  
  function calculateTotalWordCount(posts: any[]): number {
    return posts.reduce((total, post) => total + post.wordCount, 0);
  }
</script>

<div 
  in:fly={{ y: 20, duration: 300, delay: 50, easing: quintOut }} 
  out:fade={{ duration: 200 }}
  class="year-content"
>
  {#each Object.entries(months) as [monthName, postsInMonth], monthIndex}
    <MonthSection 
      {monthName} 
      {postsInMonth} 
      {monthIndex} 
      {localeLoaded} 
      {formatDate}
      totalReadTime={calculateTotalReadTime(postsInMonth)}
      totalWordCount={calculateTotalWordCount(postsInMonth)}
    />
  {/each}
</div>

<style>
  /* Smooth animation styles */
  .year-content {
    will-change: transform, opacity;
  }
</style>