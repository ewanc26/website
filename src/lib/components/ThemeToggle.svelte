<script lang="ts">
	import { onMount } from 'svelte';

	// Check if dark mode is preferred or previously set
	let isDarkMode = false;

	onMount(() => {
		// Check for saved preference in localStorage
		const savedTheme = localStorage.getItem('theme');
		
		// Check for system preference if no saved preference
		if (!savedTheme) {
			isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		} else {
			isDarkMode = savedTheme === 'dark';
		}

		// Apply theme on initial load
		applyTheme(isDarkMode);

		// Add listener for system theme changes
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			// Only update if user hasn't manually set a preference
			if (!localStorage.getItem('theme')) {
				isDarkMode = e.matches;
				applyTheme(isDarkMode);
			}
		});
	});

	// Toggle theme function
	function toggleTheme() {
		isDarkMode = !isDarkMode;
		applyTheme(isDarkMode);
		localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
	}

	// Apply theme to document
	function applyTheme(dark: boolean) {
		if (dark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
</script>

<button 
	class="theme-toggle" 
	on:click={toggleTheme} 
	aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
>
	{#if isDarkMode}
		<span class="icon">☀️</span>
		<span class="label">Light</span>
	{:else}
		<span class="icon">🌙</span>
		<span class="label">Dark</span>
	{/if}
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		background-color: var(--color-button);
		color: var(--color-text);
		border: none;
		border-radius: 2rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background-color 0.2s, transform 0.1s;
	}

	.theme-toggle:hover {
		background-color: var(--color-button-hover);
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}

	.icon {
		margin-right: 0.5rem;
	}

	.label {
		font-weight: 500;
	}

	@media (max-width: 600px) {
		.theme-toggle {
			padding: 0.4rem 0.8rem;
			font-size: 0.8rem;
		}
	}
</style>