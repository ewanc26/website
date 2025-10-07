<script lang="ts">
  import { getStores } from "$app/stores";
  const { page } = getStores();
  import type { Post } from "$components/shared";
  import { env } from "$env/dynamic/public";

  export let post: Post | undefined;

  // Generate a clean excerpt from HTML content for meta tags
  $: metaExcerpt = post?.content
    ? (() => {
        const clean = post.content
          .replace(/<[^>]+>/g, '') // Remove HTML tags
          .replace(/\s+/g, ' ') // Collapse whitespace
          .trim();

        if (clean.length <= 160) return clean;

        // Cut at nearest word boundary before 160 chars
        const truncated = clean.slice(0, 160);
        const lastSpace = truncated.lastIndexOf(' ');
        return truncated.slice(0, lastSpace) + '…';
      })()
    : "Read this blog post on Ewan's Corner.";
</script>

<svelte:head>
  {#if post !== undefined}
    <title>{post?.title} - Blog - Ewan's Corner</title>
    <meta name="description" content={metaExcerpt} />
    <meta
      name="keywords"
      content="Ewan, personal blog, coding, technology, programming, tech blog, Blog - Ewan's Corner"
    />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content={$page.url.origin + $page.url.pathname} />
    <meta
      property="og:title"
      content={`${post.title} - Blog - Ewan's Corner`}
    />
    <meta property="og:description" content={metaExcerpt} />
    <meta property="og:site_name" content="Blog - Ewan's Corner" />
    <meta
      property="og:image"
      content={`${$page.url.origin}/og/blog.png`}
    />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta
      property="article:published_time"
      content={post.createdAt.toISOString()}
    />
    <meta property="article:word_count" content={post.wordCount.toString()} />

    <!-- Fediverse -->
    {#if env.PUBLIC_ACTIVITYPUB_USER && env.PUBLIC_ACTIVITYPUB_USER.length > 0}
      <meta name="fediverse:creator" content={env.PUBLIC_ACTIVITYPUB_USER} />
    {/if}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
    <meta
      name="twitter:title"
      content={`${post.title} - Blog - Ewan's Corner`}
    />
    <meta name="twitter:description" content={metaExcerpt} />
    <meta
      name="twitter:image"
      content={`${$page.url.origin}/og/blog.png`}
    />
  {:else}
    <title>Post Not Found - Blog - Ewan's Corner</title>
    <meta
      name="description"
      content="The requested blog post could not be found."
    />
  {/if}
</svelte:head>