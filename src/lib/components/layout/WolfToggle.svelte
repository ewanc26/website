<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { wolfMode } from "$lib/stores/wolfMode";

  // Wolf mode rewrites document.body's text nodes directly; each client-side
  // navigation replaces page content, so re-apply it after every navigation
  // while it's toggled on (mirrors the Astro version's astro:page-load hook).
  afterNavigate(() => {
    if (wolfMode.get()) wolfMode.enable();
  });
</script>

<button
  class="footer-link active-press"
  aria-label={$wolfMode ? "Disable wolf mode" : "Enable wolf mode"}
  type="button"
  onclick={() => wolfMode.toggle()}
>
  {$wolfMode ? "normal" : "awoo"}
</button>

<style>
  .footer-link {
    background: none;
    border: none;
    color: var(--color-text-600);
    text-decoration: none;
    white-space: nowrap;
    padding: var(--space-sm); /* Touch target */
    font-size: var(--text-xs);
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out-quart);
  }
  .footer-link:hover {
    color: var(--color-primary-700);
  }
</style>
