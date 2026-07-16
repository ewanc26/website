<script lang="ts">
    import ShareButtons from '$lib/components/ShareButtons.svelte';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import LeafletBlocks from '$lib/components/leaflet/LeafletBlocks.svelte';
    import AtMentions from '$lib/components/AtMentions.svelte';
    import Pentacle from '$lib/components/icons/Pentacle.svelte';
    import Leaflet from '$lib/components/icons/Leaflet.svelte';
    import StandardSite from '$lib/components/icons/StandardSite.svelte';
    import { ExternalLink, Link2, Rss, MessageCircle } from '@lucide/svelte';
    import { page } from '$app/state';

    let { data } = $props();

    /** Use native block rendering when blocks are available. */
    let useBlocks = $derived(data.post.blocks && data.post.blocks.length > 0);
</script>

<SiteHead
    title={data.post.title}
    description={data.post.metaDescription}
    ogSubtitle={data.post.description}
    type="article"
    ogType="ARTICLE"
    publishedTime={data.post.createdAt}
    tags={data.post.tags}
    author="https://ewancroft.uk/about"
    documentRkey={data.post.rkey}
/>

<main class="shell-prose">
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
                    <LeafletBlocks blocks={data.post.blocks} />
                {:else}
                    {@html data.post.renderedContent}
                {/if}

                <div class="post-end-marker">
                    <Pentacle size={20} />
                </div>
            </article>

            <div class="post-after">
                {#if data.comments.length > 0}
                    <section class="comments-section">
                        <h2 class="section-heading">
                            <MessageCircle size={16} strokeWidth={2} />
                            {data.comments.length} comment{data.comments.length !== 1 ? 's' : ''}
                        </h2>
                        <ul class="comment-list">
                            {#each data.comments as comment}
                                <li class="comment">
                                    <div class="comment-head">
                                        <strong>{comment.authorDisplayName ?? comment.authorHandle}</strong>
                                        <a href="https://bsky.app/profile/{comment.authorHandle}" target="_blank" rel="noopener" class="comment-handle">@{comment.authorHandle}</a>
                                        <time class="comment-date">{new Date(comment.createdAt).toLocaleDateString('en-gb', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                                    </div>
                                    <p class="comment-body">{comment.plaintext}</p>
                                </li>
                            {/each}
                        </ul>
                    </section>
                {/if}

                {#if data.backlinks.length > 0}
                    <section class="backlinks-section" aria-labelledby="backlinks-heading">
                        <h2 class="section-heading" id="backlinks-heading">
                            <Link2 size={16} strokeWidth={2} />
                            {data.backlinks.length} backlink{data.backlinks.length !== 1 ? 's' : ''}
                        </h2>
                        <p class="backlinks-intro">Posts and articles elsewhere on the AT Protocol network that link here.</p>
                        <ul class="backlink-list">
                            {#each data.backlinks as backlink}
                                <li class="backlink">
                                    <div class="backlink-head">
                                        <div>
                                            <strong>{backlink.authorDisplayName ?? backlink.authorHandle}</strong>
                                            <a href="https://bsky.app/profile/{backlink.authorHandle}" target="_blank" rel="noopener noreferrer" class="comment-handle">@{backlink.authorHandle}</a>
                                        </div>
                                        {#if backlink.createdAt}
                                            <time class="comment-date">{new Date(backlink.createdAt).toLocaleDateString('en-gb', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                                        {/if}
                                    </div>
                                    <p class="comment-body">{backlink.text}</p>
                                    <a class="backlink-source" href={backlink.url} target="_blank" rel="noopener noreferrer">
                                        View source <ExternalLink size={13} strokeWidth={2} />
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    </section>
                {/if}

                {#if data.blog}
                    <footer class="post-footer">
                        <p class="footer-pub">
                            <a href={data.blog.url} target="_blank" rel="noopener">{data.blog.title}</a>
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
                            <a href={data.blog.rss} target="_blank" rel="noopener" class="rss-link post-provenance-link">
                                <Rss size={14} strokeWidth={2} /> RSS
                            </a>
                        </div>
                    </footer>
                {/if}
            </div>
        </div>
    </div>
</main>
