<script lang="ts">
    import { page } from '$app/state';
    import { SITE } from '$lib/config';
    import { PUBLIC_ATPROTO_DID, PUBLIC_LEAFLET_BLOG_PUBLICATION } from '$env/static/public';
    import type { NormalizedSiteInfo } from '$lib/services/atproto/siteInfo';

    let {
        title,
        description,
        ogSubtitle,
        image,
        ogType,
        type = 'website',
        publishedTime,
        tags,
        author,
        documentRkey,
    }: {
        title?: string;
        description?: string;
        /**
         * Short subtitle shown in the generated OG image.
         * Prefer this over `description` for OG images — it should be ≤60 chars.
         * Falls back to a truncated `description` if omitted.
         */
        ogSubtitle?: string;
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
        /** The rkey of the site.standard.document record for this page. */
        documentRkey?: string;
    } = $props();

    const siteInfo = $derived(page.data.siteInfo as NormalizedSiteInfo | null | undefined);
    const fullTitle = $derived(title ? `${title} — ${SITE.title}` : SITE.ogTitle);
    const fullDescription = $derived(
        description ?? siteInfo?.additionalInfo?.purpose ?? SITE.description
    );
    const canonicalUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
    const projectLicense = $derived(siteInfo?.openSourceInfo?.license);
    const pageLicense = $derived.by(() => {
        if (page.url.pathname.startsWith('/blog')) {
            return siteInfo?.additionalInfo?.sectionLicense.find(
                (license) => license.section?.toLowerCase() === 'blog'
            ) ?? projectLicense;
        }
        return projectLicense;
    });

    // Standard.site discovery and verification
    // Publication hint is for the site-wide discovery, typically root and blog index.
    const isRoot = $derived(!title);
    const publicationAtUri = $derived((isRoot || ogType === 'BLOG') && PUBLIC_ATPROTO_DID && PUBLIC_LEAFLET_BLOG_PUBLICATION 
        ? `at://${PUBLIC_ATPROTO_DID}/site.standard.publication/${PUBLIC_LEAFLET_BLOG_PUBLICATION}` 
        : undefined);
    const documentAtUri = $derived(documentRkey && PUBLIC_ATPROTO_DID 
        ? `at://${PUBLIC_ATPROTO_DID}/site.standard.document/${documentRkey}` 
        : undefined);

    // Resolve the subtitle for the OG image: prefer explicit ogSubtitle, then
    // fall back to description — clamped to 150 chars (~3 lines at 40px).
    const ogImageSubtitle = $derived.by(() => {
        const raw = ogSubtitle ?? description;
        if (!raw) return undefined;
        return raw.length > 150 ? raw.slice(0, 147) + '…' : raw;
    });
    
    // OG Image generation with fallback to absolute static asset if needed
    const ogImage = $derived.by(() => {
        if (image) return new URL(image, page.url.origin).href;
        const params = new URLSearchParams();
        if (title) params.set('title', title);
        if (ogType) params.set('type', ogType);
        if (ogImageSubtitle) params.set('subtitle', ogImageSubtitle);
        params.set('slug', page.url.pathname);
        return new URL(`/api/og/generate?${params.toString()}`, page.url.origin).href;
    });
    const ogImageAlt = $derived(
        `Social preview for ${title ?? SITE.title}${ogType ? `, labelled ${ogType.replaceAll('_', ' ').toLowerCase()}` : ''}.`
    );
</script>

<svelte:head>
    <title>{fullTitle}</title>
    <meta name="description" content={fullDescription} />
    <link rel="canonical" href={canonicalUrl} />
    {#if pageLicense?.url}
        <link rel="license" href={pageLicense.url} title={pageLicense.name} />
    {/if}

    <!-- Standard.site -->
    {#if publicationAtUri}
        <link rel="site.standard.publication" href={publicationAtUri} />
    {/if}
    {#if documentAtUri}
        <link rel="site.standard.document" href={documentAtUri} />
    {/if}

    <!-- Open Graph / Facebook / AI Search -->
    <meta property="og:type" content={type} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={fullDescription} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:image" content={ogImage} />
    {#if ogImage.startsWith('https://')}<meta property="og:image:secure_url" content={ogImage} />{/if}
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
