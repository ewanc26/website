<script lang="ts">
	// Easter egg #3 — triple-click the nav triskele.
	// Counts three clicks within a 1.5 s window, then fires.
	import Triskele from '$lib/components/icons/Triskele.svelte';
	import { triggerThree } from './eggStores';

	interface Props {
		size?: number | string;
	}
	let { size = 24 }: Props = $props();

	let clickCount = $state(0);
	let spinning = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | null = null;

	function handleClick() {
		clickCount++;
		if (resetTimer) clearTimeout(resetTimer);

		if (clickCount >= 3) {
			clickCount = 0;
			spinning = true;
			triggerThree();
			setTimeout(() => {
				spinning = false;
			}, 900);
		} else {
			resetTimer = setTimeout(() => {
				clickCount = 0;
			}, 1500);
		}
	}
</script>

<button
	type="button"
	class="te-wrap"
	aria-label="Activate triskele"
	onclick={handleClick}
>
	<span class="te-icon" class:te-spinning={spinning}>
		<Triskele {size} />
	</span>
</button>

<style>
	.te-wrap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		line-height: 1;
		cursor: pointer;
	}

	.te-wrap:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 3px;
		border-radius: var(--radius-xs);
	}

	.te-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.te-spinning {
		animation: te-spin 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	@keyframes te-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
