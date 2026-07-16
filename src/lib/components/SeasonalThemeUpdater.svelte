<script lang="ts">
	import { onMount } from 'svelte';

	const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

	async function refreshTheme() {
		try {
			const response = await fetch('/api/theme', {
				cache: 'no-store',
				headers: { accept: 'text/css' }
			});
			if (!response.ok) return;

			const css = await response.text();
			let style = document.querySelector<HTMLStyleElement>('#sabbat-dynamic-theme');
			if (!style) {
				style = document.createElement('style');
				style.id = 'sabbat-dynamic-theme';
				document.head.append(style);
			}
			style.textContent = css;
		} catch {
			// Keep the last server-rendered palette if a background refresh fails.
		}
	}

	onMount(() => {
		void refreshTheme();
		const interval = setInterval(refreshTheme, REFRESH_INTERVAL_MS);
		const handleVisibility = () => {
			if (document.visibilityState === 'visible') void refreshTheme();
		};
		document.addEventListener('visibilitychange', handleVisibility);

		return () => {
			clearInterval(interval);
			document.removeEventListener('visibilitychange', handleVisibility);
		};
	});
</script>
