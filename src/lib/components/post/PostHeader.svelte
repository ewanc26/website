<script lang="ts">
  import { fade } from "svelte/transition";
  import { formatRelativeTime } from "$lib/utils/dateFormatter";
  import { ShareIcons } from "$lib/components/icons";
  import type { Post } from "$lib/parser.ts";
  import { onMount } from 'svelte';

  let { post, profile, rkey, localeLoaded } = $props<{
    post: Post;
    profile: any;
    rkey: string;
    localeLoaded: boolean;
  }>();

  // Determine singular or plural for word count
  let wordLabel = post.wordCount === 1 ? "word" : "words";

  let displayDate = $derived(localeLoaded && post.createdAt ? formatRelativeTime(post.createdAt) : 'datetime loading...');

  let fediverseCreator = $state('');

  onMount(() => {
      const metaTag = document.querySelector('meta[name="fediverse:creator"]');
      if (metaTag) {
          fediverseCreator = metaTag.getAttribute('content') || '';
      } else if (profile?.did) {
          fediverseCreator = `https://bsky.app/profile/${profile.handle}`;
      }
  });
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
      href={`https://whtwnd.nat.vg/${profile?.did}/${rkey}`}
      onerror={(e) => {
        e.preventDefault();
        if (e.target instanceof HTMLAnchorElement) {
          e.target.href = `https://whtwnd.com/${profile?.did}/${rkey}`;
        }
      }}
      class="hover:text-[var(--link-hover-color)]">WhiteWind</a
    >
    or see the record at
    <a
      href={`https://atproto.at/viewer?uri=${profile?.did}/com.whtwnd.blog.entry/${rkey}`}
      onerror={(e) => {
        e.preventDefault();
        if (e.target instanceof HTMLAnchorElement) {
          e.target.href = `https://pdsls.dev/at://${profile?.did}/com.whtwnd.blog.entry/${rkey}`;
          e.target.textContent = 'PDSls';
        }
      }}
      class="hover:text-[var(--link-hover-color)]">atproto.at</a
    >
  </p>
  <p class="text-sm opacity-80 mt-2">
    {Math.ceil(post.wordCount / 200)} min read • {post.wordCount}
    {wordLabel}
  </p>
  <ShareIcons title={post.title} {profile} />
</div>
