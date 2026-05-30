<script lang="ts">
  import { Share2, Link2, Mail } from 'lucide-svelte';

  let { url, title } = $props<{ url: string, title: string }>();

  function copyToClipboard() {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }
</script>

<div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--color-canvas-200);">
  <a href="https://bsky.app/intent/compose?text={encodeURIComponent(title)}&url={encodeURIComponent(url)}" 
     target="_blank" rel="noopener" style="color: var(--color-ink-700); display: flex; align-items: center; gap: 4px; text-decoration: none; font-size: var(--text-sm);">
    <Share2 size={16} /> Bluesky
  </a>
  <button onclick={copyToClipboard} style="background: none; border: none; cursor: pointer; color: var(--color-ink-700); display: flex; align-items: center; gap: 4px; font-size: var(--text-sm);">
    <Link2 size={16} /> Copy Link
  </button>
  <a href="mailto:?subject={encodeURIComponent(title)}&body={encodeURIComponent(url)}" 
     style="color: var(--color-ink-700); display: flex; align-items: center; gap: 4px; text-decoration: none; font-size: var(--text-sm);">
    <Mail size={16} /> Email
  </a>
</div>
