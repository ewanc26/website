<script lang="ts">
  import { CommentSection } from "bluesky-comments-svelte";
  import type { Post } from "$lib/parser";
  import { handle } from '$lib/data/profile.json';
  import { formatDate } from '$lib/components/dateFormatter';
  import { onMount } from "svelte";

  // Define the expected type for the data prop
  interface PageData {
    rkey: string;
    posts: Map<string, Post>;
    profile: {
      handle: string;
      displayName: string;
    };
  }

  // Use the defined interface for the data prop
  let { data } = $props<{ data: PageData }>();
  
  let post: Post | undefined = $state(undefined);
  if (data.posts && data.posts.has(data.rkey)) {
    post = data.posts.get(data.rkey);
  }

  // State to track if locale has been properly loaded
  let localeLoaded = $state(false);

  onMount(() => {
    // Set a brief timeout to ensure the browser has time to determine locale
    setTimeout(() => {
      localeLoaded = true;
    }, 10);
  });
</script>

<svelte:head>
{#if post !== undefined}
  <title>{post.title} - Blog | Ewan's Web Corner</title>
  <meta name="description" content={post.excerpt} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.excerpt} />
  <meta
    property="article:published_time"
    content={post.createdAt.toISOString()}
  />
  <meta
    property="article:author"
    content={`https://bsky.app/profile/${handle}`}
  />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content={post.title} />
  <meta property="twitter:description" content={post.excerpt} />
{:else}
  <title>Post Not Found - Blog | Ewan's Web Corner</title>
  <meta
    name="description"
    content="The requested blog post could not be found."
  />
  <meta name="robots" content="noindex, follow" />
{/if}
</svelte:head>

<div class="container">
{#if post !== undefined}
  <div class="max-w-4xl mx-auto px-4">
    <h1 class="text-center my-8">{post.title}</h1>

    <!-- Subheading with update date and author -->
    <div class="text-center text-[#a9c8b3] mb-6">
      <p>
        last updated by <a
          href={`https://bsky.app/profile/${data.profile?.handle || handle}`}
          class="text-[#8bd5a0] hover:text-[#b7e6c4]"
          >{data.profile?.displayName || handle}</a
        >
        on {#if localeLoaded}{formatDate(post.createdAt)}{:else}<span
            class="opacity-50">datetime loading...</span
          >{/if}
      </p>
    </div>

    <hr class="my-6 border-[#3b574a]" />
    <article class="prose dark:prose-invert mx-auto text-center">
      {@html post.content}
    </article>
    <hr class="my-6 border-[#3b574a]" />
    <div class="comments-section">
      <CommentSection author={handle} />
    </div>
  </div>
{:else}
  <div class="flex justify-center items-center min-h-[50vh]">
    <h1 class="text-center pt-4 pb-4">No such post</h1>
  </div>
{/if}
</div>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
</style>