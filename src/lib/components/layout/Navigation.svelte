<script lang="ts">
  import { page } from "$app/stores";
  import ThemeToggle from "./ThemeToggle.svelte";

  // Function to generate breadcrumbs from the URL pathname
  function generateBreadcrumbs(pathname: string): { name: string; href: string }[] {
    const parts = pathname.split('/').filter(part => part !== '');
    let currentPath = '';
    const breadcrumbs = parts.map((part, index) => {
      currentPath += `/${part}`;
      const name = part.replace(/[-_]/g, ' ').replace(/(^|\s)\S/g, l => l.toUpperCase()); // Basic formatting
      return { name, href: currentPath };
    });

    // Add Home breadcrumb if not on the home page
    if (pathname !== '/') {
      return [{ name: 'Home', href: '/' }, ...breadcrumbs];
    } else {
      return [];
    }
  }

  // Reactive statement for breadcrumbs
  $: breadcrumbs = generateBreadcrumbs($page.url.pathname);
</script>

<nav class="flex items-center box-border my-6">
  <div class="flex items-center gap-4 flex-wrap">
    <!-- Breadcrumbs -->
    {#each breadcrumbs as crumb, index}
      {#if index > 0}
        <span class="text-[var(--text-color)] mx-px">/</span>
      {/if}
      <a href="{crumb.href}" class="font-mono text-xs sm:text-sm md:text-base lg:text-lg text-[var(--text-color)] hover:underline">
        {#if crumb.name === 'Home'}
          <!-- Home Icon -->
          &#x1F3E0;
        {:else if crumb.name === 'Blog'}
          <!-- Blog Icon -->
          &#x1F4DD;
        {:else}
          {crumb.name}
        {/if}
      </a>
    {/each}
  </div>
  <div class="ml-auto"></div>
  <ThemeToggle />
</nav>
