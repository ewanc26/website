<script lang="ts">
  import { onMount } from "svelte";
  import { getStores } from "$app/stores";
  import { createComponentDebugger } from "$lib/utils/debug.js";
  import { getCache } from "$utils/cache";
  import type { Post, LinkBoard } from "$components/shared";
  
  const { page } = getStores();
  import { DynamicLinks, LatestBlogPost } from "$components/layout/main";
  import { getLatestPosts } from "$services/blogService";

  // Create debugger for this component
  const debug = createComponentDebugger('MainPage');

  let { data } = $props();

  // State management for progressive loading with proper typing
  let localeLoaded = $state(false);
  let blogPostsLoaded = $state(false);
  let dynamicLinksLoaded = $state(false);
  let latestPosts = $state<Post[]>([]);
  let dynamicLinksData = $state<LinkBoard | undefined>(undefined);

  // Loading states
  let isLoadingPosts = $state(false);
  let isLoadingLinks = $state(false);

  // Check if we have cached data for links
  let hasCachedLinks = $state(false);

  onMount(() => {
    debug.lifecycle('MainPage', 'mounted', {
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      initialLatestPostsCount: data?.latestPosts?.length || 0,
      initialDynamicLinksCount: data?.dynamicLinks ? 'hasData' : 'noData'
    });
    
    // Check for cached links data immediately
    const cachedLinks = getCache<LinkBoard>('dynamic_links_data');
    if (cachedLinks && cachedLinks.cards && cachedLinks.cards.length > 0) {
      hasCachedLinks = true;
      debug.debug('Found cached links data');
    }
    
    // Set a brief timeout to ensure the browser has time to determine locale
    setTimeout(() => {
      localeLoaded = true;
      debug.debug('Locale loaded state updated', { localeLoaded: true });
    }, 100);

    // Progressive loading approach
    loadContentProgressively();
  });

  async function loadContentProgressively() {
    try {
      // Phase 1: Use any data that came from SSR first
      if (data?.latestPosts && data.latestPosts.length > 0) {
        latestPosts = data.latestPosts;
        blogPostsLoaded = true;
        debug.debug('Used SSR blog posts', { count: data.latestPosts.length });
      }

      if (data?.dynamicLinks) {
        dynamicLinksData = data.dynamicLinks;
        dynamicLinksLoaded = true;
        debug.debug('Used SSR dynamic links');
      }

      // Phase 2: Load blog posts if not already loaded (with delay)
      if (!blogPostsLoaded) {
        setTimeout(async () => {
          try {
            isLoadingPosts = true;
            debug.debug('Loading blog posts client-side');
            const posts = await getLatestPosts(fetch, 3);
            latestPosts = posts;
            blogPostsLoaded = true;
            debug.debug('Blog posts loaded client-side', { count: posts.length });
          } catch (error) {
            debug.errorWithContext('Failed to load blog posts', error as Error);
            blogPostsLoaded = true; // Mark as loaded to stop loading state
          } finally {
            isLoadingPosts = false;
          }
        }, 2500); // Wait 2.5 seconds before loading posts
      }

      // Phase 3: Load dynamic links if not already loaded and no cached data
      if (!dynamicLinksLoaded && !hasCachedLinks && data?.profile?.pds && data?.profile?.did) {
        setTimeout(async () => {
          try {
            isLoadingLinks = true;
            debug.debug('Loading dynamic links client-side');
            const rawResponse = await fetch(
              `${data.profile.pds}/xrpc/com.atproto.repo.listRecords?repo=${data.profile.did}&collection=blue.linkat.board&rkey=self`
            );
            if (rawResponse.ok) {
              const response = await rawResponse.json();
              if (response && response.records && response.records.length > 0) {
                dynamicLinksData = response.records[0].value as LinkBoard;
                debug.debug('Dynamic links loaded client-side');
              }
            }
            dynamicLinksLoaded = true;
          } catch (error) {
            debug.errorWithContext('Failed to load dynamic links', error as Error);
            dynamicLinksLoaded = true; // Mark as loaded to stop loading state
          } finally {
            isLoadingLinks = false;
          }
        }, 5000); // Wait 5 seconds before loading links
      } else if (!data?.profile?.pds || !data?.profile?.did || hasCachedLinks) {
        // If we don't have the necessary profile data or we have cached data, mark as loaded
        dynamicLinksLoaded = true;
      }

    } catch (error) {
      debug.errorWithContext('Error in progressive loading', error as Error);
    }
  }

  // Debug data changes
  $effect(() => {
    if (data) {
      debug.state('MainPage', 'data', {
        latestPostsCount: latestPosts?.length || 0,
        dynamicLinksType: typeof dynamicLinksData,
        hasLatestPosts: !!latestPosts?.length,
        hasDynamicLinks: !!dynamicLinksData,
        hasCachedLinks,
        blogPostsLoaded,
        dynamicLinksLoaded
      });
    }
  });
</script>

<svelte:head>
  <title>Ewan's Corner</title>
  <meta
    name="description"
    content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life."
  />
  <meta
    name="keywords"
    content="Ewan, personal website, coding, technology, programming, tech blog, Ewan's Corner"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.origin + $page.url.pathname} />
  <meta property="og:title" content="Ewan's Corner" />
  <meta
    property="og:description"
    content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life."
  />
  <meta property="og:site_name" content="Ewan's Corner" />
  <meta property="og:image" content={`${$page.url.origin}/og/main.png`} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
  <meta name="twitter:title" content="Ewan's Corner" />
  <meta
    name="twitter:description"
    content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life."
  />
  <meta name="twitter:image" content={`${$page.url.origin}/og/main.png`} />
</svelte:head>

<!-- Latest Blog Post section -->
{#if blogPostsLoaded && latestPosts && latestPosts.length > 0}
  <LatestBlogPost posts={latestPosts} {localeLoaded} />
{:else if isLoadingPosts || !blogPostsLoaded}
  <div class="text-center py-8 animate-pulse">
    Loading latest posts...
  </div>
{:else if blogPostsLoaded && (!latestPosts || latestPosts.length === 0)}
  <div class="text-center py-8">
    No blog posts available
  </div>
{/if}

<!-- Dynamic Links section - Always show component, let it handle caching internally -->
<DynamicLinks data={dynamicLinksData} />

<!-- Only show loading message if we don't have cached data and are actively loading -->
{#if !hasCachedLinks && isLoadingLinks && !dynamicLinksLoaded}
  <div class="text-center py-4 animate-pulse">
    Loading links...
  </div>
{/if}