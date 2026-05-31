<script lang="ts">
    import { page } from '$app/state';
    import { SITE } from '$lib/config';

    let { title, description, image }: { title?: string; description?: string; image?: string } = $props();

    const fullTitle = $derived(title ? `${title} — ${SITE.title}` : SITE.title);
    const fullDescription = $derived(description ?? SITE.description);
    const canonicalUrl = $derived(`${page.url.origin}${page.url.pathname}`);
    const ogImage = $derived(image ?? `${page.url.origin}/og/${encodeURIComponent(title ?? SITE.title)}`);
</script>

<svelte:head>
    <title>{fullTitle}</title>
    <meta name="description" content={fullDescription} />
    <link rel="canonical" href={canonicalUrl} />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={fullDescription} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:site_name" content={SITE.title} />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={fullDescription} />
    <meta name="twitter:image" content={ogImage} />
</svelte:head>
