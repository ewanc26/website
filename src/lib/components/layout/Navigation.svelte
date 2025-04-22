<script lang="ts">
  import { page } from '$app/stores';
  import ThemeToggle from './ThemeToggle.svelte';
  
  export const isHomePage: boolean = false;
</script>

<nav class="flex items-center box-border my-6">
  <div class="flex items-center gap-4">
    {#if $page.url.pathname !== '/'}
      <a href="/" class="font-medium text-[large] hover:text-[var(--link-hover-color)]" aria-label="Home">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </a>
    {/if}
  </div>
  <div class="ml-auto"></div>
  <ThemeToggle />
</nav>