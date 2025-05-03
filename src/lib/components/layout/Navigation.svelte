<script lang="ts">
  import { page } from '$app/stores';
  import ThemeToggle from './ThemeToggle.svelte';
  
  export const isHomePage: boolean = false;
  export let isBlogIndex: boolean = false;
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
    {#if isBlogIndex}
      <a 
        href="{$page.url.origin}/blog/rss.xml" 
        class="font-medium text-[large] hover:text-[var(--link-hover-color)]" 
        aria-label="RSS Feed"
        download="Ewans_Blog_RSS.xml"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 11a9 9 0 0 1 9 9"/>
          <path d="M4 4a16 16 0 0 1 16 16"/>
          <circle cx="5" cy="19" r="1"/>
        </svg>
      </a>
    {/if}
    {#if $page.url.pathname.startsWith('/blog/') && $page.url.pathname !== '/blog/'}
    <a href="/blog" class="flex items-center gap-2 text-sm text-[var(--text-color)] hover:text-[var(--link-hover-color)]" aria-label="Back to blog">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-book-open">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    </a>
    {/if}
  </div>
  <div class="ml-auto"></div>
  <ThemeToggle />
</nav>