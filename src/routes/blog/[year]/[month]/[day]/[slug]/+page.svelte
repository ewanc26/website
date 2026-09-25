<script lang="ts">
    import ShareButtons from '$lib/components/ShareButtons.svelte';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import CommentSection from '$lib/components/CommentSection.svelte';
    import LeafletBlocks from '$lib/components/leaflet/LeafletBlocks.svelte';
    import AtMentions from '$lib/components/AtMentions.svelte';
    import Pentacle from '$lib/components/icons/Pentacle.svelte';
    import Leaflet from '$lib/components/icons/Leaflet.svelte';
    import StandardSite from '$lib/components/icons/StandardSite.svelte';
    import { Rss } from '@lucide/svelte';
    import { page } from '$app/state';

    let { data } = $props();

    /** Use native block rendering when blocks are available. */
    let useBlocks = $derived(data.post.blocks && data.post.blocks.length > 0);

    // Reuse the same dynamic OG generator as SiteHead for posts without a
    // Standard.site cover image. This keeps the visible fallback identical to
    // the image used for social previews, without introducing another asset
    // pipeline or storing generated images in the AT Protocol record.
    const generatedCoverImage = $derived.by(() => {
        const params = new URLSearchParams({
            title: data.post.title,
            type: 'ARTICLE',
            slug: page.url.pathname,
        });
        if (data.post.description) {
            params.set('subtitle', data.post.description.slice(0, 150));
        }
        return `/api/og/generate?${params.toString()}`;
    });
    const coverImage = $derived(data.post.coverImage ?? generatedCoverImage);
    const coverImageGenerated = $derived(!data.post.coverImage);
</script>

<SiteHead
    title={data.post.title}
    description={data.post.metaDescription}
    ogSubtitle={data.post.description}
    image={data.post.coverImage}
    type="article"
    ogType="ARTICLE"
    publishedTime={data.post.createdAt}
    tags={data.post.tags}
    author="https://ewancroft.uk/about"
    documentRkey={data.post.rkey}
/>

<main class="shell-prose">
    <figure class="post-cover hero-reveal">
        <img
            src={coverImage}
            alt={coverImageGenerated ? `Generated cover image for “${data.post.title}”` : `Cover image for “${data.post.title}”`}
            width="1200"
            height="630"
            loading="eager"
            decoding="async"
        />
        {#if coverImageGenerated}
            <figcaption>Generated cover · no cover image supplied by the publication</figcaption>
        {/if}
    </figure>

    <header class="post-hd hero-reveal">
        <h1 class="post-title">{data.post.title}</h1>
        {#if data.post.description}
            <p class="post-deck">{data.post.description}</p>
        {/if}
        <div class="post-meta post-meta--stacked">
            <time>{new Date(data.post.createdAt).toLocaleDateString('en-gb', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            {#if data.post.tags && data.post.tags.length > 0}
                <div class="meta-tags post-meta-group">
                    {#each data.post.tags as tag}
                        <span class="meta-tag">{tag}</span>
                    {/each}
                </div>
            {/if}
            <div class="post-meta-group">
                <ShareButtons url={page.url.href} title={data.post.title} />
            </div>
            <div class="post-meta-group">
                <AtMentions url={page.url.href} aturi={data.post.uri} variant="default" />
            </div>
        </div>
    </header>

    <div class="post-layout animate-in stagger-1">
        <aside class="post-sidebar">
            <TableOfContents container=".prose" />
        </aside>
        <div class="post-body">
            <article class="prose">
                {#if useBlocks}
                    <LeafletBlocks
                        blocks={data.post.blocks}
                        pages={data.post.pages}
                        pageType={data.post.primaryPageType}
                        sourceUrl={data.post.url ?? data.blog?.url}
                        posts={data.readerPosts}
                        publication={data.blog}
                        references={data.readerReferences}
                    />
                {:else}
                    {@html data.post.renderedContent}
                {/if}

                <div class="post-end-marker">
                    <Pentacle size={20} />
                </div>
            </article>

            <div class="post-after">
                <CommentSection comments={data.comments} subjectUri={data.post.uri} />

                {#if data.blog}
                    <footer class="post-footer">
                        <p class="footer-pub">
                            {#if data.blog.url}
                                <a href={data.blog.url} target="_blank" rel="noopener noreferrer">{data.blog.title}</a>
                            {:else}
                                {data.blog.title}
                            {/if}
                        </p>
                        <p class="footer-desc">{data.blog.description}</p>
                        <div class="post-provenance">
                            <div class="post-provenance-row">
                                <span class="post-provenance-label">via</span>
                                <a href="https://standard.site" target="_blank" rel="noopener" aria-label="Standard.site" class="post-provenance-link">
                                    <StandardSite size={14} /> Standard.site
                                </a>
                                <a href="https://leaflet.pub" target="_blank" rel="noopener" aria-label="Leaflet" class="post-provenance-link">
                                    <Leaflet size={14} /> Leaflet
                                </a>
                            </div>
                            {#if data.blog.rss}
                                <a href={data.blog.rss} target="_blank" rel="noopener noreferrer" class="rss-link post-provenance-link">
                                    <Rss size={14} strokeWidth={2} aria-hidden="true" /> RSS
                                </a>
                            {/if}
                        </div>
                    </footer>
                {/if}
            </div>
        </div>
    </div>
</main>

<style>
    .post-cover {
        margin: 0 0 var(--space-xl);
        border-bottom: 1px solid var(--surface-color);
    }

    .post-cover img {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 1200 / 630;
        object-fit: cover;
        background: var(--surface-raised);
    }

    .post-cover figcaption {
        padding: var(--space-xs) 0;
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-500);
    }
</style>
