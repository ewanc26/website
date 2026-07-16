<script lang="ts">
  /**
   * ShareButtons — share bar for blog posts.
   * Bluesky intent link, clipboard copy, structured email template.
   * Bluesky is the primary channel; email covers the rest.
   */
  import { Check, Link2, Mail } from '@lucide/svelte';
  import Bluesky from '$lib/components/icons/Bluesky.svelte';

  let { url, title } = $props<{ url: string, title: string }>();

  let copied = $state(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  // Construct structured email template
  let emailSubject = $derived(`Check out this post: ${title}`);
  let emailBody = $derived(`I thought you might find this interesting:

Title: ${title}
URL: ${url}

---
Sent from my website.`);
  let mailtoLink = $derived(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);

  // Use intent/compose correctly for Bluesky
  let bskyLink = $derived(`https://bsky.app/intent/compose?text=${encodeURIComponent(`${title}\n\n${url}`)}`);
</script>

<div class="share-bar">
  <a href={bskyLink} target="_blank" rel="noopener" class="share-link">
    <Bluesky size={16} /> Bluesky
  </a>
  <button
    onclick={copyToClipboard}
    type="button"
    class="share-btn"
    class:share-btn--copied={copied}
    aria-live="polite"
  >
    {#if copied}
      <Check size={16} aria-hidden="true" /> Copied
    {:else}
      <Link2 size={16} aria-hidden="true" /> Copy link
    {/if}
  </button>
  <a href={mailtoLink} class="share-link">
    <Mail size={16} /> Email
  </a>
</div>
