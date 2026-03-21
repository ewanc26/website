<script lang="ts">
	import type { SiteMetadata } from '$lib/helper/siteMeta';
	import {
		PUBLIC_AP_INSTANCE_URL,
		PUBLIC_AP_USERNAME
	} from '$env/dynamic/public';

	interface Props {
		meta: SiteMetadata;
		siteMeta: SiteMetadata;
	}

	let { meta, siteMeta }: Props = $props();

	const instanceDomain = PUBLIC_AP_INSTANCE_URL
		? new URL(PUBLIC_AP_INSTANCE_URL).hostname
		: null;
	const fediverseCreator =
		PUBLIC_AP_USERNAME && instanceDomain ? `${PUBLIC_AP_USERNAME}@${instanceDomain}` : null;

	// Merge with defaults
	const finalMeta = $derived({
		title: meta.title || siteMeta.title,
		description: meta.description || siteMeta.description,
		keywords: meta.keywords || siteMeta.keywords,
		url: meta.url || siteMeta.url,
		image: meta.image || siteMeta.image,
		imageWidth: meta.imageWidth || siteMeta.imageWidth,
		imageHeight: meta.imageHeight || siteMeta.imageHeight
	});
</script>

<svelte:head>
	<title>{finalMeta.title}</title>
	<meta name="description" content={finalMeta.description} />
	<meta name="keywords" content={finalMeta.keywords} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={finalMeta.url} />
	<meta property="og:title" content={finalMeta.title} />
	<meta property="og:description" content={finalMeta.description} />
	<meta property="og:site_name" content={siteMeta.title} />
	<meta property="og:image" content={finalMeta.image} />
	{#if finalMeta.imageWidth}
		<meta property="og:image:width" content={finalMeta.imageWidth.toString()} />
	{/if}
	{#if finalMeta.imageHeight}
		<meta property="og:image:height" content={finalMeta.imageHeight.toString()} />
	{/if}

	<!-- Fediverse -->
	{#if fediverseCreator}
		<meta name="fediverse:creator" content={fediverseCreator} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={finalMeta.url} />
	<meta name="twitter:title" content={finalMeta.title} />
	<meta name="twitter:description" content={finalMeta.description} />
	<meta name="twitter:image" content={finalMeta.image} />
</svelte:head>
