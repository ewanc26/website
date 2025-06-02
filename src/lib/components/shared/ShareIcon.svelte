<script lang="ts">
  import { page } from "$app/stores";

  // Props
  export let title: string;
  export let showInHeader: boolean = false;
  export let profile: { handle: string; displayName?: string };
  export let mastodonInstance: string = "mastodon.social";
  export let fediverseCreator: string; // Add fediverseCreator prop for Mastodon tagging

  $: mastodonUserTag = fediverseCreator.startsWith('http://') || fediverseCreator.startsWith('https://') ? fediverseCreator : (fediverseCreator.startsWith('@') ? fediverseCreator : `@${fediverseCreator}`);

  // Define specific share texts for each platform
  $: blueskyShareText = `${title} by @${profile?.handle} - ${$page.url.href}`;
  $: mastodonShareText = mastodonUserTag.startsWith('http://') || mastodonUserTag.startsWith('https://') ? `${title} by ${mastodonUserTag} - ${$page.url.href}` : `${title} by ${mastodonUserTag} - ${$page.url.href}`;
  $: facebookShareText = `${title} - ${$page.url.href}`;
  $: redditShareText = `${title} - ${$page.url.href}`;

  // Truncate for character limits
  $: truncatedBlueskyText = blueskyShareText.length > 300 ? blueskyShareText.substring(0, 297) + '...' : blueskyShareText;
  $: truncatedMastodonText = mastodonShareText.length > 500 ? mastodonShareText.substring(0, 497) + '...' : mastodonShareText;
  $: truncatedFacebookText = facebookShareText.length > 280 ? facebookShareText.substring(0, 277) + '...' : facebookShareText;
  $: truncatedRedditText = redditShareText.length > 300 ? redditShareText.substring(0, 297) + '...' : redditShareText;

  // Encode the share texts for use in URLs
  $: encodedBlueskyText = encodeURIComponent(truncatedBlueskyText);
  $: encodedMastodonText = encodeURIComponent(truncatedMastodonText);
  $: encodedFacebookText = encodeURIComponent(truncatedFacebookText);
  $: encodedRedditText = encodeURIComponent(truncatedRedditText);

  // Construct the Bluesky share URL
  $: blueskyShareUrl = `https://bsky.app/intent/compose?text=${encodedBlueskyText}`;

  // Construct the Reddit share URL
  $: redditShareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent($page.url.href)}&title=${encodedRedditText}`;

  // Construct the Facebook share URL
  $: facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent($page.url.href)}&quote=${encodedFacebookText}`;

  // Construct the Mastodon share URL
  $: mastodonShareUrl = `https://${mastodonInstance}/share?text=${encodedMastodonText}`;

  // Reactive statement to open Mastodon share URL when mastodonInstance changes
  let mastodonShareTrigger = false;
  $: if (mastodonShareTrigger && mastodonInstance) {
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
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="currentColor"
    >
      <path
        d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"
      />
    </svg>
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
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="currentColor"
    >
      <path
        d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
      />
    </svg>
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
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="currentColor"
    >
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"
      />
    </svg>
  </a>

  <!-- Mastodon Share Button -->
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
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="currentColor"
    >
      <path
        d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"
      />
    </svg>
  </button>
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
