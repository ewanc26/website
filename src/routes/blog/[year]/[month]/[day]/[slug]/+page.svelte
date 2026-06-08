<script lang="ts">
    import ShareButtons from '$lib/components/ShareButtons.svelte';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import LeafletBlocks from '$lib/components/leaflet/LeafletBlocks.svelte';
    import Pentacle from '$lib/components/icons/Pentacle.svelte';
    import Leaflet from '$lib/components/icons/Leaflet.svelte';
    import StandardSite from '$lib/components/icons/StandardSite.svelte';
    import { Rss, MessageCircle } from '@lucide/svelte';
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
    ogType="BLOG"
    publishedTime={data.post.createdAt}
    tags={data.post.tags}
    author="https://ewancroft.uk/about"
/>

<main class="shell-prose">
    <header class="post-hd hero-reveal">
        <h1 class="post-title">{data.post.title}</h1>
        {#if data.post.description}
            <p class="post-desc" style="font-size: 1.25em; color: var(--color-ink-700); margin-top: -1rem; margin-bottom: 1.5rem;">{data.post.description}</p>
        {/if}
        <div class="post-meta" style="display: flex; flex-direction: column; gap: var(--space-xs);">
            <time>{new Date(data.post.createdAt).toLocaleDateString('en-gb', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            {#if data.post.tags && data.post.tags.length > 0}
                <div class="meta-tags" style="margin-top: 0.25rem;">
                    {#each data.post.tags as tag}
                        <span class="meta-tag">{tag}</span>
                    {/each}
                </div>
            {/if}
            <div style="margin-top: 0.25rem;">
                <ShareButtons url={page.url.href} title={data.post.title} />
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

                {#if data.blog}
                    <footer class="post-footer">
                        <p class="footer-pub">
                            <a href={data.blog.url} target="_blank" rel="noopener">{data.blog.title}</a>
                        </p>
                        <p class="footer-desc">{data.blog.description}</p>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.8em;">
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <span style="color: var(--color-ink-600);">via</span>
                                <a href="https://standard.site" target="_blank" rel="noopener" aria-label="Standard.site" style="display: flex; align-items: center; gap: 0.25rem; font-weight: 600;">
                                    <StandardSite size={14} /> Standard.site
                                </a>
                                <a href="https://leaflet.pub" target="_blank" rel="noopener" aria-label="Leaflet" style="display: flex; align-items: center; gap: 0.25rem; font-weight: 600;">
                                    <Leaflet size={14} /> Leaflet
                                </a>
                            </div>
                            <a href={data.blog.rss} target="_blank" rel="noopener" class="rss-link" style="display: flex; align-items: center; gap: 0.25rem; font-weight: 600;">
                                <Rss size={14} strokeWidth={2} /> RSS
                            </a>
                        </div>
                    </footer>
                {/if}
            </div>
        </div>
    </div>
</main>
