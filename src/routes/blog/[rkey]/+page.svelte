<script lang="ts" module>
  declare global {
    interface Window {
      $page: {
        url: URL;
      };
    }
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import type { Post } from "$lib/parser.ts";
  import {
    PostHead,
    PostHeader,
    PostContent,
    PostNavigation,
  } from "$lib/components/post";
  import { NotFoundMessage } from "$lib/components/shared";

  let { data }: { data: any } = $props();
  let post = $derived(data.post as Post);
  let adjacentPosts = $derived(data.adjacentPosts);

  // State to track if locale has been properly loaded
  let localeLoaded = $state(false);

  onMount(() => {
    // Set locale loaded to true when component is mounted in the browser
    localeLoaded = true;
  });
</script>

<PostHead {post} />

{#if post !== undefined}
  <div class="max-w-4xl mx-auto px-4">
    <PostHeader
      {post}
      profile={data.profile}
      rkey={data.rkey}
      {localeLoaded}
    />
    <PostContent {post} />
    <PostNavigation {adjacentPosts} />
  </div>
{:else}
  <NotFoundMessage />
{/if}
