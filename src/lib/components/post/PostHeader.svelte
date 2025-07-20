<script lang="ts">
  import { fade } from "svelte/transition";
  import { formatRelativeTime, formatDate } from "$lib/utils/dateFormatter";
  import { ShareIcons } from "$lib/components/icons";
  import type { Post } from "$lib/components/shared";
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
  let absoluteDisplayDate = $derived(localeLoaded && post.createdAt ? formatDate(new Date(post.createdAt)) : 'datetime loading...');

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

<!-- Title with more breathing room -->
<div class="flex items-center justify-between">
  <div class="flex-1"></div>
  <h1 class="text-center my-12 flex-grow leading-relaxed">{post.title}</h1>
  <div class="flex-1"></div>
</div>

<!-- Metadata section with improved spacing and grouping -->
<div class="text-center text-[var(--text-color)] opacity-80 mb-12 space-y-4">
  <!-- Author and date info -->
  <div class="space-y-2">
    <p class="text-base">
      last updated by <a
        href={`https://bsky.app/profile/${profile?.handle}`}
        class="text-[var(--link-color)] hover:text-[var(--link-hover-color)] font-medium"
        >{#key profile?.displayName}
          <span transition:fade={{ duration: 200 }}>{profile?.displayName}</span>
        {/key}</a
      >
      <span transition:fade={{ duration: 200 }}>{displayDate}</span>
    </p>
    <p class="text-sm opacity-70">
      <span transition:fade={{ duration: 200 }}>({absoluteDisplayDate})</span>
    </p>
  </div>

  <!-- Links section with subtle separation -->
  <div class="pt-3 mt-1">
    <p class="text-sm opacity-75">
      View on <a
        href={`https://whtwnd.nat.vg/${profile?.did}/${rkey}`}
        onerror={(e) => {
          e.preventDefault();
          if (e.target instanceof HTMLAnchorElement) {
            e.target.href = `https://whtwnd.com/${profile?.did}/${rkey}`;
          }
        }}
        class="hover:text-[var(--link-hover-color)] underline decoration-dotted">WhiteWind</a
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
        class="hover:text-[var(--link-hover-color)] underline decoration-dotted">atproto.at</a
      >
    </p>
  </div>

  <!-- Reading time with subtle emphasis -->
  <div class="px-2 py-1 inline-block">
    <p class="text-sm opacity-70">
      {Math.ceil(post.wordCount / 200)} min read • {post.wordCount}
      {wordLabel}
    </p>
  </div>

  <!-- Share icons with reduced spacing -->
  <div class="pt-1">
    <ShareIcons title={post.title} {profile} />
  </div>
</div>