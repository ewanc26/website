<script lang="ts">
  import { page } from "$app/stores";
  import type { Post } from "$lib/parser.ts";
  import { PUBLIC_ACTIVITYPUB_USER } from "$env/static/public";

  export let post: Post | undefined;
</script>

<svelte:head>
  {#if post !== undefined}
    <title>{post?.title} - Blog - Ewan's Corner</title>
    <meta name="description" content={post.excerpt} />
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
    <meta property="og:description" content={post.excerpt} />
    <meta property="og:site_name" content="Blog - Ewan's Corner" />
    <meta property="og:image" content={$page.url.origin + "/embed/blog.png"} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta
      property="article:published_time"
      content={post.createdAt.toISOString()}
    />
    <meta property="article:word_count" content={post.wordCount.toString()} />

    <!-- Fediverse -->
    {#if PUBLIC_ACTIVITYPUB_USER}
<meta name="fediverse:creator" content={PUBLIC_ACTIVITYPUB_USER}>
    {/if}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
    <meta
      name="twitter:title"
      content={`${post.title} - Blog - Ewan's Corner`}
    />
    <meta name="twitter:description" content={post.excerpt} />
    <meta name="twitter:image" content={$page.url.origin + "/embed/blog.png"} />
  {:else}
    <title>Post Not Found - Blog - Ewan's Corner</title>
    <meta
      name="description"
      content="The requested blog post could not be found."
    />
  {/if}
</svelte:head>
