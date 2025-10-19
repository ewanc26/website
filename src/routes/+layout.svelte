<script lang="ts">
	import '../app.css';
	import { Header, Footer, ScrollToTop } from '$lib/components/layout';
	import { createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';
	import { generateMetaTags } from '$lib/helper/metaTags';
	import { afterNavigate } from '$app/navigation';
	import type { Snippet } from 'svelte';

	interface Props {
		data: {
			siteMeta: SiteMetadata;
			meta?: Partial<SiteMetadata>;
		};
		children: Snippet;
	}

	// Use $props() instead of export let in Svelte 5 runes mode
	let { data, children }: Props = $props();
	
	// Reactive meta updates on navigation
	let headMeta = $derived(createSiteMeta({
		...data.siteMeta,
		...data.meta
	}));
	
	// Generate meta tags for SEO / OG / Twitter
	let metaTags = $derived(generateMetaTags(headMeta, data.siteMeta));

	// Update document title and meta tags after navigation
	afterNavigate(() => {
		// Force update of document title
		if (typeof document !== 'undefined') {
			document.title = headMeta.title;
		}
	});
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

<div class="flex min-h-screen flex-col bg-canvas-50 text-ink-900 dark:bg-canvas-950 dark:text-ink-50">
	<Header />
	
	<main class="container mx-auto flex-grow px-4 py-8">
		<ScrollToTop />
		{@render children()}
	</main>

	<Footer />
</div>
