<script lang="ts">
  import { Link2, Mail } from '@lucide/svelte';
  import Bluesky from '$lib/components/icons/Bluesky.svelte';

  let { url, title } = $props<{ url: string, title: string }>();

  function copyToClipboard() {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
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
  <button onclick={copyToClipboard} type="button" class="share-btn">
    <Link2 size={16} /> Copy Link
  </button>
  <a href={mailtoLink} class="share-link">
    <Mail size={16} /> Email
  </a>
</div>

<style>
  .share-bar {
    display: flex;
    gap: var(--space-md);
    margin-top: var(--space-lg);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-canvas-200);
  }

  .share-link {
    color: var(--color-ink-700);
    display: flex;
    align-items: center;
    gap: 4px;
    text-decoration: none;
    font-size: var(--text-sm);
  }

  .share-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-ink-700);
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-sm);
  }
</style>
