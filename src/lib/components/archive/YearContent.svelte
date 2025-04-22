<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import MonthSection from './MonthSection.svelte';
  
  export let year: number;
  export let months: Record<string, any[]>;
  export let localeLoaded: boolean;
  export let formatDate: (date: Date) => string;
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
    />
  {/each}
</div>

<style>
  /* Smooth animation styles */
  .year-content {
    will-change: transform, opacity;
  }
</style>