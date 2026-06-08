<script lang="ts">
	import { wolfMode } from '$lib/stores/wolfMode';
</script>

<button
	onclick={() => wolfMode.toggle()}
	class="footer-link active-press"
	aria-label={$wolfMode ? 'Disable wolf mode' : 'Enable wolf mode'}
	type="button"
>
	{$wolfMode ? 'normal' : 'awoo'}
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
