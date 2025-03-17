<script>
	import { onMount } from 'svelte';

	onMount(() => {
		console.debug('Initialising copyright year update...');

		function updateCopyrightYear() {
			const currentYear = new Date().getFullYear();
			const displayYear = currentYear < 2023 ? 2023 : currentYear;
			const copyrightElement = document.getElementById('copyright-year');

			if (copyrightElement) {
				// Update the text content with the current year
				copyrightElement.textContent = currentYear.toString();
				console.debug(`Copyright year updated to ${currentYear}`);
			} else {
				console.warn('Copyright year element not found.');
			}
		}

		// Update the copyright year when the component mounts
		updateCopyrightYear();
	});
</script>

<footer>
	<div class="container">
		<p class="credit">
			powered by <a href="https://atproto.com">atproto</a>, <a href="https://svelte.dev">svelte</a>
			and my tears
			<br />
			© 2023-<span id="copyright-year">2025</span> ewan croft
			<br />
			<a href="https://opensource.org/licenses/MIT">code licensed under the mit licence</a>
			<br />
			<a href="https://creativecommons.org/licenses/by/4.0/"
				>text and imagery licenced under cc by 4.0</a
			>
		</p>
	</div>
</footer>

<style>
	footer {
		text-align: center;
		margin-top: 2rem;
		padding: 2rem 0;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		background-color: var(--color-header-footer);
		color: var(--color-text);
		font-size: 0.9rem;
		transition:
			background-color 0.3s,
			color 0.3s;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.credit a {
		color: var(--color-link);
		text-decoration: underline;
		transition: color 0.2s;
	}

	.credit a:hover {
		color: var(--color-link-hover);
	}
</style>
