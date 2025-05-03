<script lang="ts">
  export let isBlogIndex: boolean;
  import { page } from '$app/stores';
</script>

{#if isBlogIndex}
  <!-- RSS Feed Link -->
  <div class="flex justify-end mb-4">
    <a 
      href="{$page.url.origin}/blog/rss.xml" 
      class="font-medium text-[large] hover:text-[var(--link-hover-color)]" 
      aria-label="RSS Feed"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M4 11a9 9 0 0 1 9 9"/>
        <path d="M4 4a16 16 0 0 1 16 16"/>
        <circle cx="5" cy="19" r="1"/>
      </svg>
    </a>
  </div>
{/if}