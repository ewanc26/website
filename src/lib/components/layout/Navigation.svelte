<script lang="ts">
  import { getStores } from "$app/stores";
  const { page } = getStores();
  import ThemeToggle from "./ThemeToggle.svelte";
  import { HomeIcon, RssIcon, BookOpenIcon } from "../icons";

  export const isHomePage: boolean = false;
  export let isBlogIndex: boolean = false;

  // Reactive statement to get the origin without http:// or https://
  $: cleanOrigin = $page.url.origin.replace(/^https?:\/\//, '');
</script>

<nav class="flex items-center box-border my-6">
  <div class="flex items-center gap-4">
    {#if $page.url.pathname !== "/"}
      <a
        href="/"
        class="font-medium text-[large] hover:text-[var(--link-hover-color)]"
        aria-label="Home"
      >
        <HomeIcon />
      </a>
    {/if}
    {#if isBlogIndex}
      <!-- RSS Feed Link -->
      <a
        href="{$page.url.origin}/blog/rss"
        class="font-medium text-[large] hover:text-[var(--link-hover-color)]"
        aria-label="RSS Feed"
        download="{cleanOrigin}_Blog.rss"
      >
        <RssIcon />
      </a>
    {/if}
    {#if $page.url.pathname.startsWith("/blog/") && $page.url.pathname !== "/blog/"}
      <a
        href="/blog"
        class="flex items-center gap-2 text-sm text-[var(--text-color)] hover:text-[var(--link-hover-color)]"
        aria-label="Back to blog"
      >
        <BookOpenIcon />
      </a>
    {/if}
  </div>
  <div class="ml-auto"></div>
  <ThemeToggle />
</nav>
