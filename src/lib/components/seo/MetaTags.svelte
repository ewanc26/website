<script lang="ts">
	import type { SiteMetadata } from '$lib/helper/siteMeta';

	interface Props {
		meta: SiteMetadata;
		fediverseCreator?: string | null;
	}

	let { meta, fediverseCreator }: Props = $props();
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta name="keywords" content={meta.keywords} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={meta.url} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:site_name" content={meta.title} />
	<meta property="og:image" content={meta.image} />
	{#if meta.imageWidth}
		<meta property="og:image:width" content={meta.imageWidth.toString()} />
	{/if}
	{#if meta.imageHeight}
		<meta property="og:image:height" content={meta.imageHeight.toString()} />
	{/if}
	{#if fediverseCreator}
		<meta name="fediverse:creator" content={fediverseCreator} />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={meta.url} />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
	<meta name="twitter:image" content={meta.image} />
</svelte:head>
