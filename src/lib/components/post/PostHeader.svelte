<script lang="ts">
  import { fade } from "svelte/transition";
  import { formatRelativeTime } from "$lib/dateFormatter";
  import ShareIcon from "$lib/components/shared/ShareIcon.svelte";
  import type { Post } from "$lib/parser.ts";

  let { post, profile, rkey, localeLoaded, data } = $props<{
    post: Post;
    profile: any;
    rkey: string;
    localeLoaded: boolean;
    data: any;
  }>();

  // Determine singular or plural for word count
  let wordLabel = post.wordCount === 1 ? "word" : "words";

  let displayDate = $derived(localeLoaded && post.createdAt ? formatRelativeTime(post.createdAt) : 'datetime loading...');
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
        <span transition:fade={{ duration: 200 }}>{profile?.displayName}</span>
      {/key}</a
    >

    <span transition:fade={{ duration: 200 }}>{displayDate}</span>
  </p>
  <p class="text-sm opacity-80 mt-2">
    View on <a
      href={`https://whtwnd.com/${profile?.did}/${rkey}`}
      class="hover:text-[var(--link-hover-color)]">WhiteWind</a
    >
    or see the record at
    <a
      href={`https://pdsls.dev/at://${profile?.did}/com.whtwnd.blog.entry/${rkey}`}
      class="hover:text-[var(--link-hover-color)]">PDSls</a
    >
  </p>
  <p class="text-sm opacity-80 mt-2">
    {Math.ceil(post.wordCount / 200)} min read • {post.wordCount}
    {wordLabel}
  </p>
  <ShareIcon title={post.title} {profile} {data} />
</div>
