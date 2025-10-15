<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/fallback/profile.svg';
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
	<link rel="icon" href={favicon} />
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