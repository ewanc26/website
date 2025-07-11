<script lang="ts">
  import { onMount } from "svelte";
  import YearTabs from "$lib/components/archive/YearTabs.svelte";
  import YearContent from "$lib/components/archive/YearContent.svelte";
  import { getStores } from "$app/stores";
  const { page } = getStores();
  const { data } = $props();
  import type { Post } from "$lib/parser.ts";

  // Get posts from data and sort them by createdAt in descending order (newest first)
  const posts = $derived(
    Array.from(data.posts.values() as Iterable<Post>).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  );

  // State to track if locale has been properly loaded
  let localeLoaded = $state(false);

  onMount(() => {
    // Set a brief timeout to ensure the browser has time to determine locale
    setTimeout(() => {
      localeLoaded = true;
    }, 10);
  });

  // Helper function to get only month name
  function getMonthName(date: Date): string {
    return new Intl.DateTimeFormat(
      typeof window !== "undefined" ? window.navigator.language : "en-GB",
      { month: "long" }
    ).format(date);
  }

  // Group posts by year and month
  type YearMonthGroup = {
    year: number; // Change from string to number
    months: Record<string, Post[]>;
  };

  const groupedByYear = $derived(
    (() => {
      const groups: Record<number, Record<string, Post[]>> = {}; // Change from string to number

      posts.forEach((post) => {
        const year = post.createdAt.getFullYear();
        // Ensure createdAt is a valid Date object before using it
        const month = post.createdAt instanceof Date && !isNaN(post.createdAt.getTime())
          ? getMonthName(post.createdAt)
          : 'Invalid Date'; // Fallback for invalid dates

        if (!groups[year]) groups[year] = {};
        if (!groups[year][month]) groups[year][month] = [];

        groups[year][month].push(post);
      });

      // Convert to array of year groups sorted by year (descending)
      return Object.entries(groups)
        .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
        .map(([year, months]) => ({
          year: Number(year), // Convert to number
          months,
        }));
    })() as YearMonthGroup[]
  );

  // State for active year tab - Fix: Initialize as number
  let activeYear = $state(0); // Initialize with 0 or another default number

  // Set initial active year when data is loaded
  $effect(() => {
    if (groupedByYear.length > 0) {
      activeYear = groupedByYear[0].year;
    }
  });
</script>

<svelte:head>
  <title>Blog - Ewan's Corner</title>
  <meta
    name="description"
    content="Welcome to Blog - Ewan's Corner - A personal blog where I share my thoughts on coding, technology, and life."
  />
  <meta
    name="keywords"
    content="Ewan, personal blog, coding, technology, programming, tech blog, Blog - Ewan's Corner"
  />
  <link
    rel="alternate"
    type="application/rss+xml"
    title="Blog - Ewan's Corner RSS Feed"
    href="{$page.url.origin}/blog/rss"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.origin + $page.url.pathname} />
  <meta property="og:title" content="Blog - Ewan's Corner" />
  <meta
    property="og:description"
    content="Welcome to Blog - Ewan's Corner - A personal blog where I share my thoughts on coding, technology, and life."
  />
  <meta property="og:site_name" content="Blog - Ewan's Corner" />
  <meta property="og:image" content={$page.url.origin + "/embed/blog.png"} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
  <meta name="twitter:title" content="Blog - Ewan's Corner" />
  <meta
    name="twitter:description"
    content="Welcome to Blog - Ewan's Corner - A personal blog where I share my thoughts on coding, technology, and life."
  />
  <meta name="twitter:image" content={$page.url.origin + "/embed/blog.png"} />
</svelte:head>

{#if !localeLoaded}
    <div
      class="flex justify-center items-center min-h-[200px] text-lg text-[var(--text-color)] opacity-70"
    >
      Loading...
    </div>
  {:else if !posts || posts.length === 0}

    <div
      class="flex flex-col items-center justify-center min-h-[200px] text-lg text-[var(--text-color)] opacity-70 text-center"
    >
      <p>No blog posts found.</p>
      <p class="mt-2 text-sm">This blog uses the <a href="https://whtwnd.com">WhiteWind</a> blogging lexicon, 
        <code>com.whtwnd.blog.entry</code>, but there seem to be no posts available.</p>
    </div>
{:else}
  <!-- Year tabs with animated indicator -->
  <YearTabs {groupedByYear} bind:activeYear />

  <!-- Content for active year with animations -->
  {#each groupedByYear as { year, months } (year)}
    {#if year === activeYear}
      <YearContent {year} {months} {localeLoaded} />
    {/if}
  {/each}
{/if}