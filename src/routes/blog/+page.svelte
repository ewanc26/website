<script lang="ts">
  import { onMount } from "svelte";
  import { YearContent, YearTabs, ArchiveHeader } from "$components/archive";
  import { getStores } from "$app/stores";
  const { page } = getStores();
  const { data } = $props();
  import type { Post } from "$components/shared";

  // Get posts from data with enhanced validation
  const posts = $derived(
    Array.from((data.posts || new Map()).values() as Iterable<Post>)
      .filter((post) => {
        // Enhanced validation for posts
        const hasValidTitle = post.title && typeof post.title === 'string';
        const hasValidDate = post.createdAt instanceof Date && !isNaN(post.createdAt.getTime());
        const hasValidContent = post.content && typeof post.content === 'string';
        const hasValidRkey = post.rkey && typeof post.rkey === 'string';
        
        const isValid = hasValidTitle && hasValidDate && hasValidContent && hasValidRkey;
        
        if (!isValid && process.env.NODE_ENV === 'development') {
          console.warn('Invalid post filtered out:', {
            title: post.title,
            rkey: post.rkey,
            hasValidTitle,
            hasValidDate,
            hasValidContent,
            hasValidRkey,
            createdAt: post.createdAt,
          });
        }
        
        return isValid;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
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
    try {
      return new Intl.DateTimeFormat(
        typeof window !== "undefined" ? window.navigator.language : "en-GB",
        { month: "long" }
      ).format(date);
    } catch (error) {
      console.warn('Error formatting month name:', error);
      return date.toLocaleDateString('en-GB', { month: 'long' });
    }
  }

  // Group posts by year and month
  type YearMonthGroup = {
    year: number;
    months: Record<string, Post[]>;
  };

  const groupedByYear = $derived(
    (() => {
      if (!posts || posts.length === 0) {
        return [];
      }

      const groups: Record<number, Record<string, Post[]>> = {};

      posts.forEach((post) => {
        try {
          const year = post.createdAt.getFullYear();
          const month = getMonthName(post.createdAt);

          if (!groups[year]) groups[year] = {};
          if (!groups[year][month]) groups[year][month] = [];

          groups[year][month].push(post);
        } catch (error) {
          console.warn('Error grouping post:', { post, error });
        }
      });

      // Convert to array of year groups sorted by year (descending)
      return Object.entries(groups)
        .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
        .map(([year, months]) => ({
          year: Number(year),
          months,
        }));
    })() as YearMonthGroup[]
  );

  // State for active year tab
  let activeYear = $state(0);

  // Set initial active year when data is loaded
  $effect(() => {
    if (groupedByYear.length > 0) {
      activeYear = groupedByYear[0].year;
    }
  });

  // Computed loading and error states
  const isLoading = $derived(!localeLoaded);
  const hasData = $derived(data && data.posts && data.posts.size > 0);
  const hasValidPosts = $derived(posts && posts.length > 0);
  const hasProfile = $derived(data && data.profile);
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
  <meta property="og:image" content={`${$page.url.origin}/api/og/blog.png`} />
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
  <meta name="twitter:image" content={`${$page.url.origin}/api/og/blog.png`} />
</svelte:head>

{#if isLoading}
  <div
    class="flex justify-center items-center min-h-[200px] text-lg text-[var(--text-color)] opacity-70"
  >
    Loading...
  </div>
{:else if !hasProfile}
  <div
    class="flex flex-col items-center justify-center min-h-[200px] text-lg text-[var(--text-color)] opacity-70 text-center"
  >
    <p>Unable to load profile data.</p>
    <p class="mt-2 text-sm">Please try refreshing the page.</p>
  </div>
{:else if !hasData}
  <div
    class="flex flex-col items-center justify-center min-h-[200px] text-lg text-[var(--text-color)] opacity-70 text-center"
  >
    <p>No blog data available.</p>
    <p class="mt-2 text-sm">This blog uses the <a href="https://whtwnd.com">WhiteWind</a> blogging lexicon, 
      <code>com.whtwnd.blog.entry</code>, but there seem to be no records available.</p>
  </div>
{:else if !hasValidPosts}
  <div
    class="flex flex-col items-center justify-center min-h-[200px] text-lg text-[var(--text-color)] opacity-70 text-center"
  >
    <p>No valid blog posts found.</p>
    <p class="mt-2 text-sm">Posts were found but none have valid content, titles, and dates.</p>
  </div>
{:else}
  
  <!-- Archive header with stats -->
  <ArchiveHeader {groupedByYear} />

  <!-- Year tabs with animated indicator -->
  <YearTabs {groupedByYear} bind:activeYear />

  <!-- Content for active year with animations -->
  {#each groupedByYear as { year, months } (year)}
    {#if year === activeYear}
      <YearContent {year} {months} {localeLoaded} />
    {/if}
  {/each}
{/if}