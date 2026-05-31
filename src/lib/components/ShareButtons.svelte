<script lang="ts">
  import { Link2, Mail } from '@lucide/svelte';
  import Bluesky from '$lib/components/icons/Bluesky.svelte';

  let { url, title } = $props<{ url: string, title: string }>();

  function copyToClipboard() {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }

  // Construct structured email template
  const emailSubject = `Check out this post: ${title}`;
  const emailBody = `I thought you might find this interesting:

Title: ${title}
URL: ${url}

---
Sent from my website.`;
  const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Use intent/compose correctly for Bluesky
  const bskyLink = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title}\n\n${url}`)}`;
</script>

<div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--color-canvas-200);">
  <a href={bskyLink}
     target="_blank" rel="noopener" style="color: var(--color-ink-700); display: flex; align-items: center; gap: 4px; text-decoration: none; font-size: var(--text-sm);">
    <Bluesky size={16} /> Bluesky
  </a>
  <button onclick={copyToClipboard} style="background: none; border: none; cursor: pointer; color: var(--color-ink-700); display: flex; align-items: center; gap: 4px; font-size: var(--text-sm);">
    <Link2 size={16} /> Copy Link
  </button>
  <a href={mailtoLink}
     style="color: var(--color-ink-700); display: flex; align-items: center; gap: 4px; text-decoration: none; font-size: var(--text-sm);">
    <Mail size={16} /> Email
  </a>
</div>
