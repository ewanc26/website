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

<div class="theme-switch-wrapper">
	<label class="theme-switch" for="theme-checkbox">
		<input 
			type="checkbox" 
			id="theme-checkbox" 
			checked={isDarkMode} 
			on:change={toggleTheme} 
		/>
		<div class="slider round">
			<div class="icons">
				<span class="icon sun">☀️</span>
				<span class="icon moon">🌙</span>
			</div>
		</div>
	</label>
</div>

<style>
	.theme-switch-wrapper {
		display: inline-block;
	}

	.theme-switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 30px;
		margin: 0;
	}

	.theme-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--color-button);
		transition: .4s;
		overflow: hidden;
	}

	.slider:before {
		position: absolute;
		content: "";
		height: 22px;
		width: 22px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		transition: .4s;
		z-index: 2;
	}

	input:checked + .slider:before {
		transform: translateX(30px);
	}

	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}

	.icons {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 8px;
		box-sizing: border-box;
	}

	.icon {
		font-size: 14px;
		z-index: 1;
	}

	.sun {
		margin-right: auto;
	}

	.moon {
		margin-left: auto;
	}
</style>