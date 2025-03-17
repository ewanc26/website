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
			<div class="sky-background"></div>
			<div class="icons">
				<span class="icon moon">
					<div class="moon-body"></div>
					<div class="crater crater-1"></div>
					<div class="crater crater-2"></div>
					<div class="crater crater-3"></div>
				</span>
				<span class="icon sun">
					<div class="sun-rays"></div>
					<div class="sun-core"></div>
				</span>
			</div>
			<div class="stars">
				<div class="star star-1"></div>
				<div class="star star-2"></div>
				<div class="star star-3"></div>
				<div class="star star-4"></div>
				<div class="star star-5"></div>
			</div>
		</div>
	</label>
</div>

<style>
	.theme-switch-wrapper {
		display: inline-block;
		perspective: 1000px;
	}

	.theme-switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 30px;
		margin: 0;
		transform-style: preserve-3d;
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
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		transform: translateZ(0);
	}

	.slider:before {
		position: absolute;
		content: "";
		height: 22px;
		width: 22px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		transition: .4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
		z-index: 5;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
	}

	input:checked + .slider {
		background-color: #383838;
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

	.slider:hover:before {
		box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
	}

	.sky-background {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		background: linear-gradient(to right, #87CEEB, #1E90FF);
		opacity: 1;
		transition: opacity 0.4s ease;
		z-index: 1;
	}

	input:checked + .slider .sky-background {
		background: linear-gradient(to right, #0F2027, #203A43);
		opacity: 1;
	}

	.icons {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 8px;
		box-sizing: border-box;
		z-index: 2;
	}

	.icon {
		position: relative;
		width: 16px;
		height: 16px;
		z-index: 3;
	}

	.sun {
		position: absolute;
		right: 8px;
		transition: transform 0.5s ease, opacity 0.3s ease;
		opacity: 1;
		transform: scale(1) rotate(0deg);
	}

	.sun-core {
		position: absolute;
		top: 0;
		left: 0;
		width: 16px;
		height: 16px;
		background-color: #FFDB58;
		border-radius: 50%;
		box-shadow: 0 0 10px #FFDB58;
	}

	.sun-rays {
		position: absolute;
		top: -4px;
		left: -4px;
		right: -4px;
		bottom: -4px;
		border-radius: 50%;
		background: radial-gradient(circle, transparent 40%, #FFDB58 40%, #FFDB58 45%, transparent 45%),
					radial-gradient(circle, transparent 40%, #FFDB58 40%, #FFDB58 45%, transparent 45%),
					radial-gradient(circle, transparent 40%, #FFDB58 40%, #FFDB58 45%, transparent 45%),
					radial-gradient(circle, transparent 40%, #FFDB58 40%, #FFDB58 45%, transparent 45%),
					radial-gradient(circle, transparent 40%, #FFDB58 40%, #FFDB58 45%, transparent 45%),
					radial-gradient(circle, transparent 40%, #FFDB58 40%, #FFDB58 45%, transparent 45%),
					radial-gradient(circle, transparent 40%, #FFDB58 40%, #FFDB58 45%, transparent 45%),
					radial-gradient(circle, transparent 40%, #FFDB58 40%, #FFDB58 45%, transparent 45%);
		background-size: 100% 100%;
		background-position: 50% 0%, 100% 50%, 50% 100%, 0% 50%, 85% 15%, 85% 85%, 15% 85%, 15% 15%;
		background-repeat: no-repeat;
		animation: rotate 10s linear infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	input:checked + .slider .sun {
		transform: scale(0) rotate(180deg);
		opacity: 0;
	}

	.moon {
		position: absolute;
		left: 8px;
		transition: transform 0.5s ease, opacity 0.3s ease;
		opacity: 0;
		transform: scale(0) rotate(-90deg);
	}

	.moon-body {
		position: absolute;
		top: 0;
		left: 0;
		width: 16px;
		height: 16px;
		background-color: #FEFCD7;
		border-radius: 50%;
		box-shadow: 0 0 5px rgba(254, 252, 215, 0.7);
		overflow: hidden;
	}

	.crater {
		position: absolute;
		background-color: #E8E3B9;
		border-radius: 50%;
		opacity: 0.8;
	}

	.crater-1 {
		width: 5px;
		height: 5px;
		top: 3px;
		left: 3px;
	}

	.crater-2 {
		width: 3px;
		height: 3px;
		top: 8px;
		left: 7px;
	}

	.crater-3 {
		width: 4px;
		height: 4px;
		top: 2px;
		left: 9px;
	}

	input:checked + .slider .moon {
		transform: scale(1) rotate(0deg);
		opacity: 1;
	}

	.stars {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		z-index: 2;
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
	}

	input:checked + .slider .stars {
		opacity: 1;
	}

	.star {
		position: absolute;
		background-color: white;
		border-radius: 50%;
		filter: blur(0.5px);
		animation: twinkle 2s infinite alternate;
	}

	.star-1 {
		width: 1.5px;
		height: 1.5px;
		top: 8px;
		left: 15px;
		animation-delay: 0s;
	}

	.star-2 {
		width: 2px;
		height: 2px;
		top: 5px;
		left: 25px;
		animation-delay: 0.3s;
	}

	.star-3 {
		width: 1px;
		height: 1px;
		top: 12px;
		left: 35px;
		animation-delay: 0.6s;
	}

	.star-4 {
		width: 1.5px;
		height: 1.5px;
		top: 18px;
		left: 30px;
		animation-delay: 0.9s;
	}

	.star-5 {
		width: 1px;
		height: 1px;
		top: 6px;
		left: 45px;
		animation-delay: 1.2s;
	}

	@keyframes twinkle {
		0% {
			opacity: 0.2;
			transform: scale(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1.2);
		}
	}

	/* Add a smooth transition on hover */
	.slider:hover {
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
		transform: translateY(-2px);
		transition: 
			background-color 0.4s,
			transform 0.2s,
			box-shadow 0.2s;
	}

	/* Add a bounce effect when clicked */
	.slider:active {
		transform: scale(0.95);
		transition: transform 0.1s;
	}
</style>