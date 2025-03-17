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

		// Dynamically insert the external script
		const script = document.createElement('script');
		script.src = 'https://recentfm.rknight.me/now.js?u=greenwolf745';
		script.async = true;
		document.body.appendChild(script);
	});
</script>

<footer>
	<p class="credit">
		powered by <a href="https://atproto.com">atproto</a>, <a href="https://svelte.dev">svelte</a> and my tears
		<br />
		© 2023-<span id="copyright-year">2025</span> ewan croft
		<br />
		<a href="https://opensource.org/licenses/MIT">code licensed under the mit licence</a>
		<br />
		<a href="https://creativecommons.org/licenses/by/4.0/"
			>text and imagery licenced under cc by 4.0</a
		>
	</p>
</footer>

<style>
	footer {
		text-align: center;
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid #eaeaea;
		color: #666;
		font-size: 0.9rem;
	}

	.credit a {
		color: inherit;
		text-decoration: underline;
	}
</style>
