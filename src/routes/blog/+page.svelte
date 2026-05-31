<script lang="ts">
    import { normalizeSlug } from '$lib/utils/slugify';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import { Rss } from '@lucide/svelte';

    let { data } = $props();

    type PostSummary = { title: string; createdAt: string; publicationRkey: string; rkey: string; uri: string };

    let posts: PostSummary[] = $state(data.posts);
    let hasMore = $state(data.hasMore);
    let loading = $state(false);

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

    // Group posts by year > month for display
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

<main style="padding-top: var(--space-lg);">
    <header style="margin-bottom: var(--space-xl);">
        {#if data.blog}
            <h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">{data.blog.title}</h1>
            <p style="margin: 0; opacity: 0.7;">{data.blog.description}</p>
            <a href={data.blog.rss} target="_blank" rel="noopener" style="font-size: var(--text-sm); color: var(--color-primary-500); text-decoration: none; display: inline-flex; align-items: center; gap: var(--space-xs); margin-top: var(--space-2xs);"><Rss size={14} strokeWidth={2} /> RSS</a>
        {:else}
            <h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">Blog</h1>
        {/if}
    </header>

    {#each groupPosts(posts) as [year, months]}
        <section style="margin-bottom: var(--space-xl);">
            <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-md);">{year}</h2>
            {#each months as [month, monthPosts]}
                <div style="margin-bottom: var(--space-md);">
                    <h3 style="font-size: var(--text-md); font-weight: 600; margin-bottom: var(--space-sm); opacity: 0.8;">{formatMonth(month)}</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-sm);">
                        {#each monthPosts as post}
                            <li>
                                <a href={getPostUrl(post)} style="text-decoration: none; color: inherit; display: block; padding: var(--space-md) var(--space-3); border: 1px solid var(--surface-color); border-radius: 4px;">
                                    <h4 style="margin: 0 0 var(--space-2xs); font-size: var(--text-md);">{post.title}</h4>
                                    <time style="font-size: var(--text-sm); opacity: 0.6;">{new Date(post.createdAt).toLocaleDateString()}</time>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/each}
        </section>
    {/each}

    {#if hasMore}
        <div style="text-align: center; padding: var(--space-lg) 0;">
            <button
                onclick={loadMore}
                disabled={loading}
                style="padding: var(--space-sm) var(--space-lg); border: 1px solid var(--surface-color); border-radius: 4px; background: transparent; color: inherit; cursor: pointer; font-size: var(--text-sm);"
            >
                {loading ? 'Loading...' : 'Load more'}
            </button>
        </div>
    {/if}
</main>
