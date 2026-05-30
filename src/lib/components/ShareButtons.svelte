<script lang="ts">
  import { Link2, Mail } from 'lucide-svelte';

  let { url, title } = $props<{ url: string, title: string }>();

  function copyToClipboard() {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }
</script>

<div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--color-canvas-200);">
  <a href="https://bsky.app/intent/compose?text={encodeURIComponent(title)}&url={encodeURIComponent(url)}" 
     target="_blank" rel="noopener" style="color: var(--color-ink-700); display: flex; align-items: center; gap: 4px; text-decoration: none; font-size: var(--text-sm);">
    <svg width="16" height="16" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.6366 7.81116C21.8491 13.3459 29.607 24.5681 32.4553 30.5905C35.3038 24.5685 43.0612 13.3458 50.2739 7.81116C55.4781 3.81752 63.9102 0.727462 63.9102 10.5602C63.9102 12.5239 62.8087 27.0565 62.1627 29.4158C59.9171 37.6184 51.7344 39.7106 44.4557 38.4443C57.1787 40.6577 60.4153 47.9893 53.4255 55.3209C40.1504 69.2451 34.3454 51.8273 32.8572 47.3642C32.4543 46.1554 32.4558 46.1554 32.0529 47.3642C30.5654 51.8273 24.7605 69.2455 11.4847 55.3209C4.49475 47.9893 7.73124 40.6573 20.4544 38.4443C13.1755 39.7106 4.99271 37.6184 2.74748 29.4158C2.10144 27.0563 1 12.5237 1 10.5602C1 0.727462 9.43267 3.81752 14.6366 7.81116Z"/>
    </svg>
    Bluesky
  </a>
  <button onclick={copyToClipboard} style="background: none; border: none; cursor: pointer; color: var(--color-ink-700); display: flex; align-items: center; gap: 4px; font-size: var(--text-sm);">
    <Link2 size={16} /> Copy Link
  </button>
  <a href="mailto:?subject={encodeURIComponent(title)}&body={encodeURIComponent(url)}" 
     style="color: var(--color-ink-700); display: flex; align-items: center; gap: 4px; text-decoration: none; font-size: var(--text-sm);">
    <Mail size={16} /> Email
  </a>
</div>
