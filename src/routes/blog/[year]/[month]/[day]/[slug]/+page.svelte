<script lang="ts">
    import ShareButtons from '$lib/components/ShareButtons.svelte';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import { Rss, MessageCircle } from '@lucide/svelte';
    import { page } from '$app/state';

    let { data } = $props();
</script>

<SiteHead title={data.post.title} description={data.blog?.description} />

<article style="padding-top: var(--space-lg);">
    <header style="margin-bottom: var(--space-xl);">
        <h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">{data.post.title}</h1>
        <time style="font-size: var(--text-sm); opacity: 0.6;">{new Date(data.post.createdAt).toLocaleDateString()}</time>
    </header>

    <div class="toc-layout">
        <div>
            <TableOfContents container=".prose" />
        </div>
        <div class="prose">
            {@html data.post.renderedContent}
        </div>
    </div>

    <ShareButtons url={page.url.href} title={data.post.title} />

    {#if data.comments.length > 0}
        <section style="margin-top: var(--space-xl); padding-top: var(--space-lg); border-top: 1px solid var(--surface-color);">
            <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-xs);">
                <MessageCircle size={18} strokeWidth={2} />
                {data.comments.length} comment{data.comments.length !== 1 ? 's' : ''}
            </h2>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-md);">
                {#each data.comments as comment}
                    <li style="padding: var(--space-md) var(--space-3); border: 1px solid var(--surface-color); border-radius: 4px;">
                        <div style="display: flex; align-items: baseline; gap: var(--space-sm); margin-bottom: var(--space-xs);">
                            <strong style="font-size: var(--text-sm);">{comment.authorDisplayName ?? comment.authorHandle}</strong>
                            <a href="https://bsky.app/profile/{comment.authorHandle}" target="_blank" rel="noopener" style="font-size: var(--text-xs); opacity: 0.5; text-decoration: none; color: inherit;">@{comment.authorHandle}</a>
                            <time style="font-size: var(--text-xs); opacity: 0.4; margin-left: auto;">{new Date(comment.createdAt).toLocaleDateString()}</time>
                        </div>
                        <p style="margin: 0; font-size: var(--text-sm); line-height: 1.6; white-space: pre-wrap;">{comment.plaintext}</p>
                    </li>
                {/each}
            </ul>
        </section>
    {/if}

    {#if data.blog}
        <footer style="margin-top: var(--space-lg); padding-top: var(--space-lg); border-top: 1px solid var(--surface-color); display: flex; flex-direction: column; gap: var(--space-xs);">
            <p style="margin: 0; font-size: var(--text-sm); font-weight: 600; color: var(--color-ink-900);">
                <a href={data.blog.url} target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">{data.blog.title}</a>
            </p>
            <p style="margin: 0; font-size: var(--text-sm); color: var(--color-ink-700);">{data.blog.description}</p>
            <a href={data.blog.rss} target="_blank" rel="noopener" style="font-size: var(--text-sm); color: var(--color-primary-500); text-decoration: none; display: inline-flex; align-items: center; gap: var(--space-xs); margin-top: var(--space-2xs);"><Rss size={14} strokeWidth={2} /> RSS</a>
        </footer>
    {/if}
</article>

<style>
    .toc-layout {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
    }

    @media (min-width: 64rem) {
        .toc-layout {
            flex-direction: row;
            gap: var(--space-xl);
            align-items: flex-start;
        }

        .toc-layout > :first-child {
            flex-shrink: 0;
            width: 14rem;
        }

        .toc-layout > :last-child {
            min-width: 0;
            flex: 1;
        }
    }
</style>
