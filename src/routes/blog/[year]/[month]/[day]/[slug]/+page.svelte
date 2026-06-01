<script lang="ts">
    import ShareButtons from '$lib/components/ShareButtons.svelte';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import LeafletBlocks from '$lib/components/leaflet/LeafletBlocks.svelte';
    import { Rss, MessageCircle } from '@lucide/svelte';
    import { page } from '$app/state';

    let { data } = $props();

    /** Use native block rendering when blocks are available. */
    let useBlocks = $derived(data.post.blocks && data.post.blocks.length > 0);
</script>

<SiteHead title={data.post.title} description={data.blog?.description} />

<main class="shell-prose">
    <header class="post-hd">
        <h1 class="post-title">{data.post.title}</h1>
        <div class="post-meta">
            <time>{new Date(data.post.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
        </div>
    </header>

    <div class="post-layout">
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
            </article>

            <div class="post-after">
                <ShareButtons url={page.url.href} title={data.post.title} />

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
                                        <time class="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</time>
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
                        <a href={data.blog.rss} target="_blank" rel="noopener" class="rss-link"><Rss size={14} strokeWidth={2} /> RSS</a>
                    </footer>
                {/if}
            </div>
        </div>
    </div>
</main>

<style>
    .post-hd {
        padding: var(--space-lg) 0;
    }

    .post-title {
        font-size: clamp(2rem, 5vw, 3.5rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        line-height: 1;
        margin: 0 0 var(--space-md);
    }

    .post-meta {
        display: flex;
        gap: var(--space-md);
        flex-wrap: wrap;
        font-size: var(--text-xs);
        color: var(--color-ink-600);
    }

    /* Two-column layout: sidebar + content */
    .post-layout {
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: var(--space-lg);
        padding: var(--space-lg) 0;
        align-items: start;
        contain: layout;
    }

    .post-sidebar {
        position: sticky;
        top: 72px;
        height: max-content;
        min-width: 0;
        contain-intrinsic-size: auto 150px;
    }

    .post-body {
        min-width: 0;
    }

    .post-after {
        max-width: 70ch;
        margin-top: var(--space-lg);
        padding-top: var(--space-lg);
    }

    /* Comments */
    .comments-section {
        margin-top: var(--space-lg);
        padding-top: var(--space-lg);
    }

    .comments-section .section-heading {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
    }

    .comment-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .comment {
        padding: var(--space-md);
        border: 1px solid var(--surface-color);
        border-radius: var(--radius-lg);
    }

    .comment-head {
        display: flex;
        align-items: baseline;
        gap: var(--space-sm);
        margin-bottom: var(--space-xs);
    }

    .comment-handle {
        font-size: var(--text-xs);
        opacity: 0.5;
        text-decoration: none;
        color: inherit;
    }

    .comment-date {
        font-size: var(--text-xs);
        opacity: 0.4;
        margin-left: auto;
    }

    .comment-body {
        margin: 0;
        font-size: var(--text-sm);
        line-height: 1.6;
        white-space: pre-wrap;
    }

    /* Post footer */
    .post-footer {
        margin-top: var(--space-lg);
        padding-top: var(--space-lg);
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
    }

    .footer-pub {
        margin: 0;
        font-weight: 600;
    }

    .footer-pub a {
        color: inherit;
        text-decoration: none;
    }

    .footer-desc {
        margin: 0;
        font-size: var(--text-sm);
        color: var(--color-ink-700);
    }

    .rss-link {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        margin-top: var(--space-2xs);
        font-size: var(--text-sm);
        color: var(--color-primary-500);
        text-decoration: none;
    }

    /* Responsive: collapse sidebar on narrow screens */
    @media (max-width: 900px) {
        .post-layout {
            grid-template-columns: 1fr;
        }

        .post-sidebar {
            position: static;
            height: auto;
        }
    }

    @media (max-width: 560px) {
        .post-title {
            font-size: clamp(1.5rem, 8vw, 2.5rem);
        }
    }
</style>
