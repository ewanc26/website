<script lang="ts">
  import { page } from "$app/stores";
  import type { Post } from "$lib/parser.ts";

  export let post: Post | undefined;
</script>

<svelte:head>
  {#if post !== undefined}
    <title>{post.title} - Ewan's Blog</title>
    <meta name="description" content={post.excerpt} />
    <meta
      name="keywords"
      content="Ewan, personal blog, coding, technology, programming, tech blog, Ewan's Blog"
    />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content={$page.url.origin + $page.url.pathname} />
    <meta property="og:title" content={`${post.title} - Ewan's Blog`} />
    <meta property="og:description" content={post.excerpt} />
    <meta property="og:site_name" content="Ewan's Blog" />
    <meta
      property="og:image"
      content={$page.url.origin + "/embed/blog.png"}
    />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta
      property="article:published_time"
      content={post.createdAt.toISOString()}
    />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
    <meta name="twitter:title" content={`${post.title} - Ewan's Blog`} />
    <meta name="twitter:description" content={post.excerpt} />
    <meta
      name="twitter:image"
      content={$page.url.origin + "/embed/blog.png"}
    />
  {:else}
    <title>Post Not Found - Ewan's Blog</title>
    <meta
      name="description"
      content="The requested blog post could not be found."
    />
  {/if}
</svelte:head>