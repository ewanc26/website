<script lang="ts">
  import { getStores } from "$app/stores";
  const { page } = getStores();
  import { env } from '$env/dynamic/public';

  // Icons
  import { BlueskyIcon, MastodonIcon, CopyLinkIcon } from "$components/icons";

  // Props
  export let title: string;
  export let showInHeader: boolean = false;
  export let profile: { handle: string; displayName?: string; did?: string };
  export let mastodonInstance: string = "mastodon.social";
  let fediverseCreator: string | undefined = env.PUBLIC_ACTIVITYPUB_USER;

  $: mastodonUserTag =
    fediverseCreator &&
    (fediverseCreator.startsWith("http://") ||
      fediverseCreator.startsWith("https://"))
      ? fediverseCreator
      : fediverseCreator && fediverseCreator.startsWith("@")
        ? fediverseCreator
        : `@${fediverseCreator}`;

  // Share texts
  $: blueskyShareText = `${title} by @${profile?.handle} - ${$page.url.href}`;
  $: mastodonShareText =
    mastodonUserTag
      ? mastodonUserTag.startsWith("http://") ||
        mastodonUserTag.startsWith("https://")
        ? `${title} by ${mastodonUserTag} - ${$page.url.href}`
        : `${title} by ${mastodonUserTag} - ${$page.url.href}`
      : `${title} - ${$page.url.href}`;

  // Clipboard copy text with DID fallback to handle
  $: clipboardShareText = `${title} by https://bsky.app/profile/${profile?.did || profile?.handle} - ${$page.url.href}`;

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

  // Encode share texts
  $: encodedBlueskyText = encodeURIComponent(truncatedBlueskyText);
  $: encodedMastodonText =
    mastodonShareText && encodeURIComponent(truncatedMastodonText);

  // Share URLs
  $: blueskyShareUrl = `https://bsky.app/intent/compose?text=${encodedBlueskyText}`;
  $: mastodonShareUrl =
    mastodonShareText &&
    `https://${mastodonInstance}/share?text=${encodedMastodonText}`;

  // Trigger Mastodon share
  let mastodonShareTrigger = false;
  $: if (mastodonShareTrigger && mastodonInstance && mastodonShareUrl) {
    window.open(mastodonShareUrl, "_blank", "noopener,noreferrer");
    mastodonShareTrigger = false;
  }

  // Copy Link button logic
  let copyLinkText = "Get Link";
  let showCopyFeedback = false;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(clipboardShareText);
      copyLinkText = "Sorted!";
      showCopyFeedback = true;
      setTimeout(() => {
        showCopyFeedback = false;
        copyLinkText = "Get Link";
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      copyLinkText = "Couldn’t Copy";
      showCopyFeedback = true;
      setTimeout(() => {
        showCopyFeedback = false;
        copyLinkText = "Get Link";
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
      aria-label="Get Link"
      title="Get Link"
    >
      <CopyLinkIcon />
    </button>
    {#if showCopyFeedback}
      <span
        class="copy-feedback absolute left-full ml-2 text-sm font-medium"
        class:copied={copyLinkText === 'Sorted!'}
        class:failed={copyLinkText === 'Couldn’t Copy'}
      >
        {copyLinkText}
      </span>
    {/if}
  </div>
</div>

<style>
  .icon-button {
    color: var(--text-color);
  }

  .icon-button:hover {
    background-color: var(--button-hover-bg) !important;
  }

  @media (max-width: 640px) {
    .share-icons {
      gap: 0.5rem;
    }
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