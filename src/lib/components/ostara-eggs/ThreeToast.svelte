<script lang="ts">
	// Easter egg #3 — toast that appears after three triskele clicks.
	// Rendered at layout level so it's never inside an <a> tag.
	import { threeVisible } from './eggStores';
</script>

{#if $threeVisible}
	<div class="three-toast" role="status" aria-live="polite">Three again.</div>
{/if}

<style>
	.three-toast {
		position: fixed;
		bottom: 4.5rem;
		left: 50%;
		transform: translateX(-50%);
		background: var(--surface-raised);
		border: 1px solid var(--color-text-200);
		color: var(--color-text-800);
		font-family: var(--font-mono);
		font-size: var(--text-xs, 0.75rem);
		letter-spacing: 0.02em;
		padding: var(--space-sm) var(--space-6);
		border-radius: var(--radius-md);
		z-index: 9999;
		white-space: nowrap;
		pointer-events: none;
		animation:
			tt-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
			tt-out 0.3s ease-in forwards 2.7s;
	}

	@keyframes tt-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	@keyframes tt-out {
		from {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
		to {
			opacity: 0;
			transform: translateX(-50%) translateY(-4px);
		}
	}
</style>
