<script lang="ts">
	import { wolfMode } from '$lib/stores/wolfMode';

	let isWolfMode = $state(false);

	// Subscribe to store changes
	$effect(() => {
		const unsubscribe = wolfMode.subscribe((value) => {
			isWolfMode = value;
		});
		return unsubscribe;
	});

	function toggleWolfMode() {
		wolfMode.toggle();
	}
</script>

<button
	onclick={toggleWolfMode}
	class="footer-link"
	aria-label={isWolfMode ? 'Disable wolf mode' : 'Enable wolf mode'}
	type="button"
>
	{isWolfMode ? 'normal' : 'awoo'}
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
  }
  .footer-link:hover {
    color: var(--color-primary-700);
  }
</style>
