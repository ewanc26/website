<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/fallback/profile.svg';
	import { getStores } from '$app/stores';
	import { Header, Footer, ScrollToTop } from '$lib/components/layout';
	import { createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';

	const { page } = getStores();

	// Pages can return `meta` from their +page.ts
	export let data: { siteMeta: SiteMetadata; meta?: Partial<SiteMetadata> };

	// reactive meta for <svelte:head>, includes page-specific overrides
	$: headMeta = createSiteMeta({
		...data.siteMeta,
		...data.meta,
		...$page.data.meta,
		url: $page.url?.href ?? data.siteMeta.url ?? ''
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{headMeta.title}</title>

	<meta name="description" content={headMeta.description} />
	<meta name="keywords" content={headMeta.keywords} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={headMeta.url} />
	<meta property="og:title" content={headMeta.title} />
	<meta property="og:description" content={headMeta.description} />
	<meta property="og:site_name" content={headMeta.title} />
	<meta property="og:image" content={headMeta.image} />
	{#if headMeta.imageWidth}
		<meta property="og:image:width" content={headMeta.imageWidth.toString()} />
	{/if}
	{#if headMeta.imageHeight}
		<meta property="og:image:height" content={headMeta.imageHeight.toString()} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={headMeta.url} />
	<meta name="twitter:title" content={headMeta.title} />
	<meta name="twitter:description" content={headMeta.description} />
	<meta name="twitter:image" content={headMeta.image} />
</svelte:head>

<div class="flex min-h-screen flex-col bg-canvas-50 dark:bg-canvas-950 text-ink-900 dark:text-ink-50">
	<!-- Pass only the default site meta to the header -->
	<Header meta={data.siteMeta} />

	<main class="flex-grow container mx-auto px-4 py-8">
		<ScrollToTop />
		<slot />
	</main>

	<Footer />
</div>