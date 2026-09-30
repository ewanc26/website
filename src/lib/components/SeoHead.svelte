<script lang="ts">
  /**
   * Per-page SEO/meta head. Base.astro computed all of this from page props
   * plus the request URL; the request-URL-dependent bits (canonical, OG
   * image, JSON-LD mainEntityOfPage) now read from SvelteKit's `page` state
   * instead of `Astro.url`. The site-wide dynamic theme <style> and other
   * global <head> bits live in the root layout, not here.
   */
  import { page } from "$app/state";
  import { SITE, ME_LINKS } from "$lib/config";
  import { PUBLIC_ATPROTO_DID, PUBLIC_LEAFLET_BLOG_PUBLICATION } from "$env/static/public";
  import type { NormalizedSiteInfo } from "$lib/services/atproto/siteInfo";

  interface Props {
    title?: string;
    description?: string;
    /** Short subtitle for the generated OG image (\u226460 chars ideal). */
    ogSubtitle?: string;
    /** Label on the OG image, e.g. BLOG, ABOUT. */
    ogType?: string;
    image?: string;
    type?: "website" | "article";
    publishedTime?: string;
    tags?: string[];
    author?: string;
    /** rkey of the site.standard.document record for this page. */
    documentRkey?: string;
    siteInfo?: NormalizedSiteInfo | null;
  }
  let {
    title,
    description,
    ogSubtitle,
    ogType,
    image,
    type = "website",
    publishedTime,
    tags,
    author,
    documentRkey,
    siteInfo = null,
  }: Props = $props();

  const pathname = $derived(page.url.pathname);
  const fullTitle = $derived(title ? `${title} \u2014 ${SITE.title}` : SITE.ogTitle);
  const rawDescription = $derived(description ?? siteInfo?.additionalInfo?.purpose ?? SITE.description);
  const fullDescription = $derived(
    rawDescription.length > 125
      ? rawDescription
          .slice(0, 124)
          .replace(/\s+\S*$/, "")
          .replace(/[.,;:]$/, "") + "\u2026"
      : rawDescription,
  );
  const canonical = $derived(new URL(pathname, page.url.origin).href);

  const person = {
    "@type": "Person",
    "@id": "https://ewancroft.uk/#me",
    name: "Ewan Croft",
    url: "https://ewancroft.uk",
    description: SITE.description,
    sameAs: ME_LINKS,
  };
  const jsonLd = $derived(
    type === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description: fullDescription,
          datePublished: publishedTime,
          keywords: tags?.join(", "),
          mainEntityOfPage: canonical,
          author: person,
        }
      : ogType === "HOME" || ogType === "ABOUT"
        ? { "@context": "https://schema.org", ...person }
        : undefined,
  );

  const projectLicense = $derived(siteInfo?.openSourceInfo?.license);
  const pageLicense = $derived(
    pathname.startsWith("/blog")
      ? (siteInfo?.additionalInfo?.sectionLicense.find((l) => l.section?.toLowerCase() === "blog") ?? projectLicense)
      : projectLicense,
  );

  const publicationAtUri = $derived(
    (!title || ogType === "BLOG") && PUBLIC_ATPROTO_DID && PUBLIC_LEAFLET_BLOG_PUBLICATION
      ? `at://${PUBLIC_ATPROTO_DID}/site.standard.publication/${PUBLIC_LEAFLET_BLOG_PUBLICATION}`
      : undefined,
  );
  const documentAtUri = $derived(
    documentRkey && PUBLIC_ATPROTO_DID
      ? `at://${PUBLIC_ATPROTO_DID}/site.standard.document/${documentRkey}`
      : undefined,
  );

  const rawSubtitle = $derived(ogSubtitle ?? description);
  const ogSub = $derived(rawSubtitle && rawSubtitle.length > 150 ? `${rawSubtitle.slice(0, 147)}\u2026` : rawSubtitle);
  const ogImage = $derived.by(() => {
    if (image) return new URL(image, page.url.origin).href;
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (ogType) params.set("type", ogType);
    if (ogSub) params.set("subtitle", ogSub);
    params.set("slug", pathname);
    return new URL(`/api/og/generate?${params}`, page.url.origin).href;
  });
  const ogAlt = $derived(
    `Social preview for ${title ?? SITE.title}${ogType ? `, labelled ${ogType.replaceAll("_", " ").toLowerCase()}` : ""}.`,
  );
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={fullDescription} />
  <link rel="canonical" href={canonical} />
  {#if pageLicense?.url}
    <link rel="license" href={pageLicense.url} title={pageLicense.name} />
  {/if}

  {#if publicationAtUri}
    <link rel="site.standard.publication" href={publicationAtUri} />
  {/if}
  {#if documentAtUri}
    <link rel="site.standard.document" href={documentAtUri} />
  {/if}

  {#if jsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</` + `script>`}
  {/if}

  <meta property="og:type" content={type} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={fullDescription} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  {#if ogImage.startsWith("https://")}
    <meta property="og:image:secure_url" content={ogImage} />
  {/if}
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={ogAlt} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:site_name" content={SITE.title} />
  <meta property="og:locale" content="en_GB" />
  {#if type === "article" && publishedTime}
    <meta property="article:published_time" content={publishedTime} />
  {/if}
  {#if type === "article" && author}
    <meta property="article:author" content={author} />
  {/if}
  {#if type === "article" && tags}
    {#each tags as tag (tag)}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@ewancroft" />
  <meta name="twitter:creator" content="@ewancroft" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={fullDescription} />
  <meta name="twitter:image" content={ogImage} />
  <meta name="twitter:image:alt" content={ogAlt} />
</svelte:head>
