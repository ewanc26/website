<script lang="ts">
	/**
	 * AmbianceToggle — footer switch for the generative background soundscape.
	 * Reads the ambianceEnabled store; the actual audio graph lives in
	 * AmbianceEngine, mounted once in the root layout.
	 */
	import { Volume2, VolumeX } from '@lucide/svelte';
	import { ambianceEnabled } from '$lib/stores/ambiance';
</script>

<button
	onclick={() => ambianceEnabled.toggle()}
	class="footer-link ambiance-toggle active-press"
	aria-label={$ambianceEnabled ? 'Mute background ambiance' : 'Play background ambiance'}
	aria-pressed={$ambianceEnabled}
	type="button"
>
	{#if $ambianceEnabled}
		<Volume2 size={14} aria-hidden="true" />
	{:else}
		<VolumeX size={14} aria-hidden="true" />
	{/if}
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
	.ambiance-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
</style>
