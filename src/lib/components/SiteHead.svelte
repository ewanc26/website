<script lang="ts">
    import { page } from '$app/state';
    import { SITE } from '$lib/config';

    let {
        title,
        description,
        image,
        ogType,
        type = 'website',
        publishedTime,
        tags,
        author,
    }: {
        title?: string;
        description?: string;
        image?: string;
        /** Label shown in the generated OG image (e.g. 'BLOG', 'ABOUT'). */
        ogType?: string;
        /** Controls og:type — 'article' for posts, 'website' everywhere else. */
        type?: 'website' | 'article';
        /** ISO 8601 publish date, used for article:published_time. */
        publishedTime?: string;
        /** Tag list, used for article:tag. */
        tags?: string[];
        /** Author URL, used for article:author. */
        author?: string;
    } = $props();

    const fullTitle = $derived(title ? `${title} — ${SITE.title}` : SITE.ogTitle);
    const fullDescription = $derived(description ?? SITE.description);
    const canonicalUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
    
    // OG Image generation with fallback to absolute static asset if needed
    const ogImage = $derived(image ?? new URL(`/api/og/generate?title=${encodeURIComponent(title ?? SITE.ogTitle)}${ogType ? `&type=${encodeURIComponent(ogType)}` : ''}${description ? `&subtitle=${encodeURIComponent(description)}` : ''}`, page.url.origin).href);
    const ogImageAlt = $derived(title ? `OpenGraph image for ${title}` : `OpenGraph image for ${SITE.ogTitle}`);
</script>

<svelte:head>
    <title>{fullTitle}</title>
    <meta name="description" content={fullDescription} />
    <link rel="canonical" href={canonicalUrl} />

    <!-- Open Graph / Facebook / AI Search -->
    <meta property="og:type" content={type} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={fullDescription} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={ogImageAlt} />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:site_name" content={SITE.title} />
    <meta property="og:locale" content="en_GB" />

    <!-- Article-specific Open Graph -->
    {#if type === 'article'}
        {#if publishedTime}<meta property="article:published_time" content={publishedTime} />{/if}
        {#if author}<meta property="article:author" content={author} />{/if}
        {#if tags}{#each tags as tag}<meta property="article:tag" content={tag} />{/each}{/if}
    {/if}

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@ewancroft" />
    <meta name="twitter:creator" content="@ewancroft" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={fullDescription} />
    <meta name="twitter:image" content={ogImage} />
    <meta name="twitter:image:alt" content={ogImageAlt} />
</svelte:head>
