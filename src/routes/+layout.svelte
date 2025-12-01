<script lang="ts">
	import '../app.css';
	import { Header, Footer, ScrollToTop } from '$lib/components/layout';
	import { MetaTags } from '$lib/components/seo';
	import { createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';
	import type { ProfileData, SiteInfoData } from '$lib/services/atproto';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	interface Props {
		data: {
			siteMeta: SiteMetadata;
			meta?: Partial<SiteMetadata>;
			profile?: ProfileData | null;
			siteInfo?: SiteInfoData | null;
		};
		children: Snippet;
	}

	// Use $props() instead of export let in Svelte 5 runes mode
	let { data, children }: Props = $props();

	onMount(() => {
		console.info('[App] Application mounted');

		// Setup global error handler
		window.onerror = (msg, url, lineNo, columnNo, error) => {
			console.error('[App] Global error:', {
				message: msg,
				url,
				lineNo,
				columnNo,
				error
			});
			return false;
		};

		// Setup unhandled promise rejection handler
		window.onunhandledrejection = (event) => {
			console.error('[App] Unhandled promise rejection:', event.reason);
		};
	});

	// Reactive meta updates on navigation
	let headMeta = $derived(
		createSiteMeta({
			...data.siteMeta,
			...data.meta
		})
	);
</script>

<svelte:head>
	<script>
		// Prevent flash of unstyled content (FOUC) by applying theme before page renders
		(function () {
			const stored = localStorage.getItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const isDark = stored === 'dark' || (!stored && prefersDark);
			const htmlElement = document.documentElement;

			if (isDark) {
				htmlElement.classList.add('dark');
				htmlElement.style.colorScheme = 'dark';
			} else {
				htmlElement.classList.remove('dark');
				htmlElement.style.colorScheme = 'light';
			}
		})();
	</script>
	<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
	<link rel="icon" href="/favicon/favicon.ico" sizes="any" />
	<link rel="manifest" href="/favicon/site.webmanifest" />
</svelte:head>

<!-- Bespoke MetaTags component -->
<MetaTags meta={headMeta} siteMeta={data.siteMeta} />

<div
	class="flex min-h-screen flex-col overflow-x-hidden bg-canvas-50 text-ink-900 dark:bg-canvas-950 dark:text-ink-50"
>
	<Header />

	<main id="main-content" class="container mx-auto grow px-4 py-8" tabindex="-1">
		<ScrollToTop />
		{@render children()}
	</main>

	<Footer profile={data.profile} siteInfo={data.siteInfo} />
</div>
