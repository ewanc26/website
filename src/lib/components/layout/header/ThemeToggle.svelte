<script lang="ts">
	import { onMount } from 'svelte';
	import { Sun, Moon } from '@lucide/svelte';

	let isDark = $state(false);
	let mounted = $state(false);

	onMount(() => {
		// Check localStorage and system preference
		const stored = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		isDark = stored === 'light' || (!stored && !prefersDark);
		updateTheme();
		mounted = true;

		// Listen for system preference changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem('theme')) {
				isDark = e.matches;
				updateTheme();
			}
		};
		mediaQuery.addEventListener('change', handleChange);

		return () => {
			mediaQuery.removeEventListener('change', handleChange);
		};
	});

	function updateTheme() {
		const htmlElement = document.documentElement;

		if (isDark) {
			htmlElement.classList.remove('dark');
			htmlElement.style.colorScheme = 'light';
		} else {
			htmlElement.classList.add('dark');
			htmlElement.style.colorScheme = 'dark';
		}
	}

	function toggleTheme() {
		isDark = !isDark;
		localStorage.setItem('theme', isDark ? 'light' : 'dark');
		updateTheme();
	}
</script>

<button
	onclick={toggleTheme}
	class="relative flex h-10 w-10 items-center justify-center rounded-lg bg-canvas-200 text-ink-900 transition-all hover:bg-canvas-300 dark:bg-canvas-800 dark:text-ink-50 dark:hover:bg-canvas-700"
	aria-label={isDark ? 'Switch to dark mode' : 'Switch to light mode'}
	type="button"
>
	{#if mounted}
		<div class="relative h-5 w-5">
			<Moon
				class="absolute inset-0 h-5 w-5 transition-all duration-300 {isDark
					? 'scale-100 rotate-0 opacity-100'
					: 'scale-0 rotate-90 opacity-0'}"
				aria-hidden="true"
			/>
			<Sun
				class="absolute inset-0 h-5 w-5 transition-all duration-300 {isDark
					? 'scale-0 -rotate-90 opacity-0'
					: 'scale-100 rotate-0 opacity-100'}"
				aria-hidden="true"
			/>
		</div>
	{:else}
		<div class="h-5 w-5 animate-pulse rounded bg-canvas-300 dark:bg-canvas-700"></div>
	{/if}
</button>
