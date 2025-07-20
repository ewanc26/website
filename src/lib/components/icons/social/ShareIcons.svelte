<script lang="ts">
  import { getStores } from "$app/stores";
  const { page } = getStores();
  import { env } from '$env/dynamic/public';

  // Icons
  import { BlueskyIcon, FacebookIcon, RedditIcon, MastodonIcon, CopyLinkIcon } from "$lib/components/icons";

  // Props
  export let title: string;
  export let showInHeader: boolean = false;
  export let profile: { handle: string; displayName?: string };
  export let mastodonInstance: string = "mastodon.social";
  // Add fediverseCreator prop for Mastodon tagging
  let fediverseCreator: string | undefined = env.PUBLIC_ACTIVITYPUB_USER;

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

  // Copy Link
  let copyLinkText = "Copy Link";
  let showCopyFeedback = false;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText($page.url.href);
      copyLinkText = "Copied!";
      showCopyFeedback = true;
      setTimeout(() => {
        showCopyFeedback = false;
        copyLinkText = "Copy Link";
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      copyLinkText = "Failed!";
      showCopyFeedback = true;
      setTimeout(() => {
        showCopyFeedback = false;
        copyLinkText = "Copy Link";
      }, 2000);
    }
  };
</script>

<div
  class={`share-icons flex items-center gap-2 ${showInHeader ? "ml-auto mr-2" : "justify-center my-4"}`}
>
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

  {#if env.PUBLIC_ACTIVITYPUB_USER && env.PUBLIC_ACTIVITYPUB_USER.length > 0}
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

  <!-- Copy Link Button -->
  <div class="relative flex items-center">
    <button
      on:click={copyLink}
      class="icon-button p-2 rounded-full transition-all duration-300 hover:scale-110"
      style="background-color: var(--card-bg);"
      aria-label="Copy Link"
      title="Copy Link"
    >
      <CopyLinkIcon />
    </button>
    {#if showCopyFeedback}
      <span
        class="copy-feedback absolute left-full ml-2 text-sm font-medium"
        class:copied={copyLinkText === 'Copied!'}
        class:failed={copyLinkText === 'Failed!'}
      >
        {copyLinkText}
      </span>
    {/if}
  </div>
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
    
    /* Hide copy feedback text on mobile */
    .copy-feedback {
      display: none;
    }
  }

  .copy-feedback {
    opacity: 0;
    animation: fade-in-out 2s forwards;
  }

  .copy-feedback.copied {
    color: var(--accent-color);
  }

  .copy-feedback.failed {
    color: var(--error-color);
  }

  @keyframes fade-in-out {
    0% {
      opacity: 0;
      transform: translateX(-10px);
    }
    20% {
      opacity: 1;
      transform: translateX(0);
    }
    80% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 0;
      transform: translateX(10px);
    }
  }
</style>