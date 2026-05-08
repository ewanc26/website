<script lang="ts">
	import { navigating } from '$app/stores';

	let isLoading = $state(false);
	let progress = $state(0);
	let showBar = $state(false);
	let fadeOut = $state(false);

	$effect(() => {
		if ($navigating) {
			isLoading = true;
			showBar = true;
			fadeOut = false;
			// Start at a small width, then advance
			progress = 30;
			requestAnimationFrame(() => {
				progress = 80;
			});
		} else if (isLoading) {
			// Navigation complete — fill to 100%
			progress = 100;
			isLoading = false;
			// Fade out after the bar completes
			fadeOut = true;
			setTimeout(() => {
				showBar = false;
				progress = 0;
				fadeOut = false;
			}, 300);
		}
	});
</script>

{#if showBar}
	<div
		class="fixed top-0 left-0 z-[60] h-0.5 bg-primary-500 transition-[width] duration-300 ease-out dark:bg-primary-400"
		class:opacity-0={fadeOut}
		class:transition-opacity={fadeOut}
		style="width: {progress}%"
		role="progressbar"
		aria-label="Loading page"
	></div>
{/if}
