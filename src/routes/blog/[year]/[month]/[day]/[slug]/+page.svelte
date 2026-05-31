<script lang="ts">
    import ShareButtons from '$lib/components/ShareButtons.svelte';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import { Rss } from '@lucide/svelte';
    import { page } from '$app/state';

    let { data } = $props();
</script>

<SiteHead title={data.post.title} description={data.blog?.description} />

<article style="padding-top: var(--space-lg);">
    <header style="margin-bottom: var(--space-xl);">
        <h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">{data.post.title}</h1>
        <time style="font-size: var(--text-sm); opacity: 0.6;">{new Date(data.post.createdAt).toLocaleDateString()}</time>
    </header>
    <TableOfContents container=".prose" />
    <div class="prose">
        {@html data.post.renderedContent}
    </div>
    <ShareButtons url={page.url.href} title={data.post.title} />
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
