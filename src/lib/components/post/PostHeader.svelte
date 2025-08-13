<script lang="ts">
  import { fade } from "svelte/transition";
  import { formatRelativeTime, formatDate } from "$utils/formatters";
  import { ShareIcons } from "$components/icons";
  import { formatNumber } from "$utils/formatters";
  import type { Post } from "$components/shared";
  import { onMount } from 'svelte';

  let { post, profile, rkey, localeLoaded } = $props<{
    post: Post;
    profile: any;
    rkey: string;
    localeLoaded: boolean;
  }>();

  // Determine singular or plural for word count
  let wordLabel = post.wordCount === 1 ? "word" : "words";

  // Enhanced loading states with better fallbacks
  let displayDate = $derived(
    localeLoaded && post.createdAt ? 
    formatRelativeTime(post.createdAt) : 
    'loading...'
  );
  
  let absoluteDisplayDate = $derived(
    localeLoaded && post.createdAt ? 
    formatDate(new Date(post.createdAt)) : 
    'loading date...'
  );

  let fediverseCreator = $state('');

  // Profile data with loading state
  let profileDisplayName = $derived(profile?.displayName || 'Loading author...');
  let profileHandle = $derived(profile?.handle || 'loading');
  let profileDid = $derived(profile?.did || '');

  onMount(() => {
    const metaTag = document.querySelector('meta[name="fediverse:creator"]');
    if (metaTag) {
      fediverseCreator = metaTag.getAttribute('content') || '';
    } else if (profileDid) {
      fediverseCreator = `https://bsky.app/profile/${profileHandle}`;
    }
  });

  // Validate post data to prevent errors
  let isValidPost = $derived(
    post && 
    post.title && 
    post.createdAt instanceof Date && 
    !isNaN(post.createdAt.getTime()) &&
    typeof post.wordCount === 'number'
  );
</script>

{#if isValidPost}
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
        last updated by 
        {#if profile?.handle}
          <a
            href={`https://bsky.app/profile/${profileHandle}`}
            class="text-[var(--link-color)] hover:text-[var(--link-hover-color)] font-medium"
          >
            {#key profileDisplayName}
              <span transition:fade={{ duration: 200 }}>{profileDisplayName}</span>
            {/key}
          </a>
        {:else}
          <span class="opacity-60">{profileDisplayName}</span>
        {/if}
        <span transition:fade={{ duration: 200 }}>{displayDate}</span>
      </p>
      <p class="text-sm opacity-70">
        <span transition:fade={{ duration: 200 }}>({absoluteDisplayDate})</span>
      </p>
    </div>

    <!-- Links section with subtle separation -->
    {#if profileDid && rkey}
      <div class="pt-3 mt-1">
        <p class="text-sm opacity-75">
          View on <a
            href={`https://whtwnd.nat.vg/${profileDid}/${rkey}`}
            onerror={(e) => {
              e.preventDefault();
              if (e.target instanceof HTMLAnchorElement) {
                e.target.href = `https://whtwnd.com/${profileDid}/${rkey}`;
              }
            }}
            class="hover:text-[var(--link-hover-color)] underline decoration-dotted"
          >
            WhiteWind
          </a>
          or see the record at
          <a
            href={`https://atproto.at/viewer?uri=${profileDid}/com.whtwnd.blog.entry/${rkey}`}
            onerror={(e) => {
              e.preventDefault();
              if (e.target instanceof HTMLAnchorElement) {
                e.target.href = `https://pdsls.dev/at://${profileDid}/com.whtwnd.blog.entry/${rkey}`;
                e.target.textContent = 'PDSls';
              }
            }}
            class="hover:text-[var(--link-hover-color)] underline decoration-dotted"
          >
            atproto.at
          </a>
        </p>
      </div>
    {/if}

    <!-- Reading time with subtle emphasis -->
    <div class="px-2 py-1 inline-block">
      <p class="text-sm opacity-70">
        {Math.ceil(post.wordCount / 200)} min read • {formatNumber(post.wordCount)}
        {wordLabel}
      </p>
    </div>

    <!-- Share icons with reduced spacing - only show when profile is loaded -->
    {#if profile?.handle}
      <div class="pt-1">
        <ShareIcons title={post.title} {profile} />
      </div>
    {/if}
  </div>
{:else}
  <!-- Fallback loading state if post data is invalid -->
  <div class="text-center my-12 space-y-4">
    <h1 class="opacity-50">Loading post...</h1>
    <div class="text-sm opacity-40">
      <p>Loading post metadata...</p>
    </div>
  </div>
{/if}