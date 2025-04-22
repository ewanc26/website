<script lang="ts">
  import { fade } from "svelte/transition";
  import { formatDate } from "$lib/dateFormatter";
  import ShareIcon from "$lib/components/shared/ShareIcon.svelte";
  import type { Post } from "$lib/parser.ts";

  export let post: Post;
  export let profile: any;
  export let rkey: string;
  export let localeLoaded: boolean;
  export let data: any;
</script>

<div class="flex items-center justify-between">
  <div class="flex-1"></div>
  <h1 class="text-center my-8 flex-grow">{post.title}</h1>
  <div class="flex-1"></div>
</div>

<!-- Subheading with update date and author -->
<div class="text-center text-[var(--text-color)] opacity-80 mb-6">
  <p>
    last updated by <a
      href={`https://bsky.app/profile/${profile?.handle}`}
      class="text-[var(--link-color)] hover:text-[var(--link-hover-color)]"
      >{#key profile?.displayName}
        <span transition:fade={{ duration: 200 }}
          >{profile?.displayName}</span
        >
      {/key}</a
    >
    on {#if localeLoaded}
      <span transition:fade={{ duration: 200 }}
        >{formatDate(post.createdAt)}</span
      >
    {:else}
      <span class="opacity-50">datetime loading...</span>
    {/if}
  </p>
  <p class="text-sm opacity-80 mt-2">
    {Math.ceil(post.wordCount / 200)} min read • View on <a
      href={`https://whtwnd.com/${profile?.did}/${rkey}`}
      class="hover:text-[var(--link-hover-color)]">WhiteWind</a
    >
    or see the record at
    <a
      href={`https://pdsls.dev/at://${profile?.did}/com.whtwnd.blog.entry/${rkey}`}
      class="hover:text-[var(--link-hover-color)]">PDSls</a
    >
  </p>
  <ShareIcon title={post.title} profile={profile} {data} />
</div>