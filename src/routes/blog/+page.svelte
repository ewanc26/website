<script lang="ts">
    import { normalizeSlug } from '$lib/utils/slugify';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import { Rss } from '@lucide/svelte';

    let { data } = $props();

    type PostSummary = { title: string; createdAt: string; publicationRkey?: string; rkey: string; url: string };
    let posts: PostSummary[] = $state([]);
    let hasMore = $state(false);
    let loading = $state(false);

    $effect.pre(() => {
        posts = data.posts;
        hasMore = data.hasMore;
    });

    function getPostUrl(post: PostSummary) {
        const date = new Date(post.createdAt);
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        const slug = normalizeSlug(post.title);
        return `/blog/${y}/${m}/${d}/${slug}`;
    }

    function formatMonth(month: number) {
        return new Date(2000, month - 1, 1).toLocaleDateString('en-GB', { month: 'long' });
    }

    function groupPosts(posts: PostSummary[]) {
        const grouped = new Map<number, Map<number, PostSummary[]>>();
        for (const post of posts) {
            const date = new Date(post.createdAt);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            if (!grouped.has(year)) grouped.set(year, new Map());
            const yearMap = grouped.get(year)!;
            if (!yearMap.has(month)) yearMap.set(month, []);
            yearMap.get(month)!.push(post);
        }
        return grouped;
    }

    async function loadMore() {
        if (loading || !hasMore) return;
        loading = true;
        try {
            const res = await fetch(`/api/blog/posts?offset=${posts.length}&limit=${data.pageSize}`);
            const result = await res.json();
            posts = [...posts, ...result.posts];
            hasMore = posts.length < result.total;
        } finally {
            loading = false;
        }
    }
</script>

<SiteHead title={data.blog?.title ?? 'Blog'} description={data.blog?.description} />

<main class="shell-wide">
    <header class="page-hd">
        <div>
            <h1 class="page-title">{data.blog?.title ?? 'Blog'}</h1>
            {#if data.blog}
                <p style="margin: var(--space-sm) 0 0; color: var(--color-ink-700);">{data.blog.description}</p>
                <a href={data.blog.rss} target="_blank" rel="noopener" class="rss-link"><Rss size={14} strokeWidth={2} /> RSS</a>
            {/if}
        </div>
    </header>

    {#each groupPosts(posts) as [year, months]}
        <div class="year-head">{year}</div>
        {#each months as [month, monthPosts]}
            <div class="month-label">{formatMonth(month)}</div>
            {#each monthPosts as post}
                <a href={getPostUrl(post)} class="post-row">
                    <span class="post-title">{post.title}</span>
                    <time class="post-date">{new Date(post.createdAt).toLocaleDateString()}</time>
                </a>
            {/each}
        {/each}
    {/each}

    {#if hasMore}
        <div style="text-align: center; padding: var(--space-lg) 0;">
            <button
                onclick={loadMore}
                disabled={loading}
                class="load-more"
            >
                {loading ? 'Loading...' : 'Load more'}
            </button>
        </div>
    {/if}
</main>

<style>
    .page-hd {
        padding: var(--space-lg) 0;
    }

    .page-title {
        font-size: clamp(2rem, 5vw, 3.5rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        margin: 0;
    }

    .rss-link {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        margin-top: var(--space-sm);
        font-size: var(--text-sm);
        color: var(--color-primary-500);
        text-decoration: none;
    }

    .year-head {
        font-family: var(--font-mono);
        color: var(--color-ink-600);
        font-size: var(--text-xs);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: var(--space-lg) 0 var(--space-sm);
    }

    .month-label {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--color-ink-700);
        padding: var(--space-sm) 0 var(--space-xs);
    }

    .post-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: var(--space-md);
        padding: var(--space-sm) 0;
        border-bottom: 1px dashed var(--surface-color);
        text-decoration: none;
        color: inherit;
        transition: background-color var(--duration-fast) var(--ease-out-quart);
    }

    .post-row:hover {
        background-color: var(--surface-raised);
        padding-left: var(--space-sm);
        padding-right: var(--space-sm);
        margin-left: calc(-1 * var(--space-sm));
        margin-right: calc(-1 * var(--space-sm));
    }

    .post-title {
        font-weight: 600;
    }

    .post-date {
        font-size: var(--text-xs);
        color: var(--color-ink-600);
        white-space: nowrap;
        flex-shrink: 0;
    }

    .load-more {
        padding: var(--space-sm) var(--space-lg);
        border: 1px solid var(--surface-color);
        border-radius: var(--radius-md);
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-size: var(--text-sm);
        font-family: var(--font-family);
    }

    @media (max-width: 560px) {
        .post-row {
            flex-direction: column;
            gap: var(--space-2xs);
        }
    }
</style>
