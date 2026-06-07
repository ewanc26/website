<script lang="ts">
	// Easter egg #4 — Mōnandæg (Moon's day).
	// On Mondays, adds `is-moon-day` to <body> so CSS can apply a silver tint
	// to the nav triskele. The Footer reads the same day check independently.
	import { onMount } from 'svelte';

	let isMoonDay = $state(false);

	onMount(() => {
		// Client-side only — respects the visitor's local timezone.
		isMoonDay = new Date().getDay() === 1;
	});
</script>

<svelte:body class:is-moon-day={isMoonDay} />

<style>
	/*
	 * Monday: Mōnandæg — Moon's day.
	 * The nav triskele shifts to silver. Subtle. For those who notice.
	 * "She's there — look up."
	 */
	:global(body.is-moon-day .nav-brand) {
		color: oklch(72% 0.025 245);
		transition: color 1.5s ease;
	}

	:global(body.is-moon-day .nav-brand svg) {
		filter: drop-shadow(0 0 5px oklch(80% 0.035 245 / 0.5));
		transition: filter 1.5s ease;
	}
</style>
