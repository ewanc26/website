<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/fallback/profile.svg';
	import { getStores } from '$app/stores';
	import { siteMeta } from '$lib/helper';
	import { Header, Footer, ScrollToTop } from '$lib/components/layout';

	const { page } = getStores();

	let { children } = $props();

	// Clone siteMeta and set dynamic properties
	const meta = {
		...siteMeta,
		url: $page.url.origin + $page.url.pathname
	};

	const metaTags = [
		{ name: 'description', content: meta.description },
		{ name: 'keywords', content: meta.keywords },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:url', content: meta.url },
		{ property: 'og:title', content: meta.title },
		{ property: 'og:description', content: meta.description },
		{ property: 'og:site_name', content: meta.title },
		{ property: 'og:image', content: meta.image },
		{ property: 'og:image:width', content: meta.imageWidth?.toString() },
		{ property: 'og:image:height', content: meta.imageHeight?.toString() },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:url', content: meta.url },
		{ name: 'twitter:title', content: meta.title },
		{ name: 'twitter:description', content: meta.description },
		{ name: 'twitter:image', content: meta.image }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{meta.title}</title>

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
		{@render children?.()}
	</main>

	<Footer />
</div>