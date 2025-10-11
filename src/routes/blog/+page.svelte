<script lang="ts">
  import { onMount } from "svelte";
  import { YearContent, YearTabs, ArchiveHeader } from "$components/archive";
  import { page } from "$app/stores";
  const { data } = $props();
  import type { Post } from "$components/shared";

  // Get posts from SSR data
  const posts = $derived(
    Array.from((data.posts || new Map()).values() as Iterable<Post>)
      .filter((post) => {
        const hasValidTitle = post.title && typeof post.title === 'string';
        const hasValidDate = post.createdAt instanceof Date && !isNaN(post.createdAt.getTime());
        const hasValidContent = post.content && typeof post.content === 'string';
        const hasValidRkey = post.rkey && typeof post.rkey === 'string';
        return hasValidTitle && hasValidDate && hasValidContent && hasValidRkey;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  );

  let localeLoaded = $state(false);

  onMount(() => {
    setTimeout(() => {
      localeLoaded = true;
    }, 10);
  });

  function getMonthName(date: Date): string {
    try {
      return new Intl.DateTimeFormat(
        typeof window !== "undefined" ? window.navigator.language : "en-GB",
        { month: "long" }
      ).format(date);
    } catch (error) {
      return date.toLocaleDateString('en-GB', { month: 'long' });
    }
  }

  type YearMonthGroup = {
    year: number;
    months: Record<string, Post[]>;
  };

  const groupedByYear = $derived(
    (() => {
      if (!posts || posts.length === 0) return [];

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

      return Object.entries(groups)
        .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
        .map(([year, months]) => ({
          year: Number(year),
          months,
        }));
    })() as YearMonthGroup[]
  );

  let activeYear = $state(0);

  $effect(() => {
    if (groupedByYear.length > 0) {
      activeYear = groupedByYear[0].year;
    }
  });

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

  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.origin + $page.url.pathname} />
  <meta property="og:title" content="Blog - Ewan's Corner" />
  <meta
    property="og:description"
    content="Welcome to Blog - Ewan's Corner - A personal blog where I share my thoughts on coding, technology, and life."
  />
  <meta property="og:site_name" content="Blog - Ewan's Corner" />
  <meta property="og:image" content={`${$page.url.origin}/og/blog.png`} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
  <meta name="twitter:title" content="Blog - Ewan's Corner" />
  <meta
    name="twitter:description"
    content="Welcome to Blog - Ewan's Corner - A personal blog where I share my thoughts on coding, technology, and life."
  />
  <meta name="twitter:image" content={`${$page.url.origin}/og/blog.png`} />
</svelte:head>

{#if isLoading}
  <div class="flex justify-center items-center min-h-[200px] text-lg opacity-70">
    Loading...
  </div>
{:else if !hasProfile}
  <div class="flex flex-col items-center justify-center min-h-[200px] text-lg opacity-70 text-center">
    <p>Unable to load profile data.</p>
    <p class="mt-2 text-sm">Please try refreshing the page.</p>
  </div>
{:else if !hasData}
  <div class="flex flex-col items-center justify-center min-h-[200px] text-lg opacity-70 text-center">
    <p>No blog data available.</p>
  </div>
{:else if !hasValidPosts}
  <div class="flex flex-col items-center justify-center min-h-[200px] text-lg opacity-70 text-center">
    <p>No valid blog posts found.</p>
  </div>
{:else}
  <ArchiveHeader {groupedByYear} />
  <YearTabs {groupedByYear} bind:activeYear />

  {#each groupedByYear as { year, months } (year)}
    {#if year === activeYear}
      <YearContent {year} {months} {localeLoaded} />
    {/if}
  {/each}
{/if}
