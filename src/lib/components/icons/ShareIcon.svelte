<script lang="ts">
  import { getStores } from "$app/stores";
  const { page } = getStores();
  import { PUBLIC_ACTIVITYPUB_USER } from '$env/static/public';
  import { BlueskyIcon, FacebookIcon, RedditIcon, MastodonIcon } from ".";

  // Props
  export let title: string;
  export let showInHeader: boolean = false;
  export let profile: { handle: string; displayName?: string };
  export let mastodonInstance: string = "mastodon.social";
  // Add fediverseCreator prop for Mastodon tagging
  let fediverseCreator: string | undefined = PUBLIC_ACTIVITYPUB_USER;

  $: mastodonUserTag =
    fediverseCreator &&
    (fediverseCreator.startsWith("http://") ||
      fediverseCreator.startsWith("https://"))
      ? fediverseCreator
      : fediverseCreator && fediverseCreator.startsWith("@")
        ? fediverseCreator
        : `@${fediverseCreator}`;

  // Define specific share texts for each platform
  $: blueskyShareText = `${title} by @${profile?.handle} - ${$page.url.href}`;
  $: mastodonShareText =
    mastodonUserTag
      ? mastodonUserTag.startsWith("http://") ||
        mastodonUserTag.startsWith("https://")
        ? `${title} by ${mastodonUserTag} - ${$page.url.href}`
        : `${title} by ${mastodonUserTag} - ${$page.url.href}`
      : `${title} - ${$page.url.href}`;
  $: facebookShareText = `${title} - ${$page.url.href}`;
  $: redditShareText = `${title} - ${$page.url.href}`;

  // Truncate for character limits
  $: truncatedBlueskyText =
    blueskyShareText.length > 300
      ? blueskyShareText.substring(0, 297) + "..."
      : blueskyShareText;
  $: truncatedMastodonText =
    mastodonShareText &&
    (mastodonShareText.length > 500
      ? mastodonShareText.substring(0, 497) + "..."
      : mastodonShareText);
  $: truncatedFacebookText =
    facebookShareText.length > 280
      ? facebookShareText.substring(0, 277) + "..."
      : facebookShareText;
  $: truncatedRedditText =
    redditShareText.length > 300
      ? redditShareText.substring(0, 297) + "..."
      : redditShareText;

  // Encode the share texts for use in URLs
  $: encodedBlueskyText = encodeURIComponent(truncatedBlueskyText);
  $: encodedMastodonText =
    mastodonShareText && encodeURIComponent(truncatedMastodonText);
  $: encodedFacebookText = encodeURIComponent(truncatedFacebookText);
  $: encodedRedditText = encodeURIComponent(truncatedRedditText);

  // Construct the Bluesky share URL
  $: blueskyShareUrl = `https://bsky.app/intent/compose?text=${encodedBlueskyText}`;

  // Construct the Reddit share URL
  $: redditShareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent($page.url.href)}&title=${encodedRedditText}`;

  // Construct the Facebook share URL
  $: facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent($page.url.href)}&quote=${encodedFacebookText}`;

  // Construct the Mastodon share URL
  $: mastodonShareUrl =
    mastodonShareText &&
    `https://${mastodonInstance}/share?text=${encodedMastodonText}`;

  // Reactive statement to open Mastodon share URL when mastodonInstance changes
  let mastodonShareTrigger = false;
  $: if (mastodonShareTrigger && mastodonInstance && mastodonShareUrl) {
    window.open(mastodonShareUrl, "_blank", "noopener,noreferrer");
    mastodonShareTrigger = false; // Reset trigger
  }
</script>

<div
  class={`share-icons flex items-center gap-2 ${showInHeader ? "ml-auto mr-2" : "justify-center my-4"}`}
>
  <span class="text-sm opacity-70 mr-1">Share to</span>

  <!-- Bluesky Share Button -->
  <a
    href={blueskyShareUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="icon-button p-2 rounded-full transition-all duration-300 hover:scale-110"
    style="background-color: var(--card-bg);"
    aria-label="Share on Bluesky"
    title="Share on Bluesky"
  >
    <BlueskyIcon />
  </a>

  <!-- Facebook Share Button -->
  <a
    href={facebookShareUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="icon-button p-2 rounded-full transition-all duration-300 hover:scale-110"
    style="background-color: var(--card-bg);"
    aria-label="Share on Facebook"
    title="Share on Facebook"
  >
    <FacebookIcon />
  </a>

  <!-- Reddit Share Button -->
  <a
    href={redditShareUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="icon-button p-2 rounded-full transition-all duration-300 hover:scale-110"
    style="background-color: var(--card-bg);"
    aria-label="Share on Reddit"
    title="Share on Reddit"
  >
    <RedditIcon />
  </a>

  {#if PUBLIC_ACTIVITYPUB_USER && PUBLIC_ACTIVITYPUB_USER.length > 0}
    <button
      on:click|preventDefault={() => {
        const instance = prompt(
          "Enter your Mastodon instance (e.g. mastodon.social):",
          mastodonInstance
        );
        if (instance) {
          mastodonInstance = instance;
          mastodonShareTrigger = true;
        }
      }}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          const instance = prompt(
            "Enter your Mastodon instance (e.g. mastodon.social):",
            mastodonInstance
          );
          if (instance) {
            mastodonInstance = instance;
            mastodonShareTrigger = true;
          }
        }
      }}
      class="icon-button p-2 rounded-full transition-all duration-300 hover:scale-110"
      style="background-color: var(--card-bg);"
      aria-label="Share on Mastodon"
      title="Share on Mastodon"
      tabindex="0"
    >
      <MastodonIcon />
    </button>
  {/if}
</div>

<style>
  /* Common icon styling - this will match ThemeToggle.svelte */
  .icon-button {
    color: var(--text-color);
  }

  .icon-button:hover {
    background-color: var(--button-hover-bg) !important;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .share-icons {
      gap: 0.5rem;
    }
  }
</style>
