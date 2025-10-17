<script lang="ts">
	import '../app.css';
	import { Header, Footer, ScrollToTop } from '$lib/components/layout';
	import { createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';
	import { generateMetaTags } from '$lib/helper/metaTags';

	export let data: { siteMeta: SiteMetadata; meta?: Partial<SiteMetadata> };
	// meta for <svelte:head> (page-specific overrides included)
	const headMeta = createSiteMeta({
		...data.siteMeta,
		...data.meta
	});
	// generate meta tags for SEO / OG / Twitter
	const metaTags = generateMetaTags(headMeta, data.siteMeta);
</script>

<svelte:head>
	<script>
		// Prevent flash of unstyled content (FOUC) by applying theme before page renders
		(function() {
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
	<title>{headMeta.title}</title>

	{#each metaTags as tag}
		{#if tag.name}
			<meta name={tag.name} content={tag.content} />
		{:else if tag.property}
			<meta property={tag.property} content={tag.content} />
		{/if}
	{/each}
</svelte:head>

<div class="flex min-h-screen flex-col bg-canvas-50 dark:bg-canvas-950 text-ink-900 dark:text-ink-50">
	<Header />
	
	<main class="flex-grow container mx-auto px-4 py-8">
		<ScrollToTop />
		<slot />
	</main>

	<Footer />
</div>