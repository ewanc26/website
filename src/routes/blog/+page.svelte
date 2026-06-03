<script lang="ts">
    import { normalizeSlug } from '$lib/utils/slugify';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import { Rss } from '@lucide/svelte';

    let { data } = $props();

    type PostSummary = { title: string; createdAt: string; publicationRkey?: string; rkey: string; url: string; tags: string[] };
    let posts: PostSummary[] = $state([]);
    let hasMore = $state(false);
    let loading = $state(false);
    let searchQuery = $state('');

    $effect.pre(() => {
        posts = data.posts;
        hasMore = data.hasMore;
    });

    let filteredPosts = $derived(posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ));

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
        return Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]);
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

<SiteHead title={data.blog?.title ?? 'Blog'} description={data.blog?.description} ogType="BLOG" />

<main class="shell-wide">
    <header class="page-hd">
        <h1 class="page-title">{data.blog?.title ?? 'Blog'}</h1>
        {#if data.blog}
            <p class="page-desc">{data.blog.description}</p>
            <a href={data.blog.rss} target="_blank" rel="noopener" class="section-link"><Rss size={14} strokeWidth={2} /> RSS</a>
        {/if}
        <input 
            type="search" 
            placeholder="Search posts or tags..." 
            bind:value={searchQuery}
            class="blog-search"
        />
    </header>

    {#each groupPosts(filteredPosts) as [year, months]}
        <div class="year-head">{year}</div>
        {#each Array.from(months.entries()).sort((a, b) => b[0] - a[0]) as [month, monthPosts]}
            <div class="month-label">{formatMonth(month)}</div>
            <ul class="post-list">
                {#each monthPosts as post}
                    <li>
                        <a href={getPostUrl(post)} class="post-row">
                            <span class="post-title">{post.title}</span>
                            <time class="post-date">{new Date(post.createdAt).toLocaleDateString()}</time>
                        </a>
                    </li>
                {/each}
            </ul>
        {/each}
    {/each}

    {#if hasMore}
        <div class="load-more">
            <button
                onclick={loadMore}
                disabled={loading}
                type="button"
            >
                {loading ? 'Loading...' : 'Load more'}
            </button>
        </div>
    {/if}
</main>
<style>
    .blog-search {
        margin-top: var(--space-md);
        width: 100%;
        padding: var(--space-xs) var(--space-sm);
        border: 1px solid var(--surface-color);
        border-radius: var(--radius-md);
        background: var(--surface-raised);
        box-sizing: border-box;
        transition: border-color var(--duration-fast) var(--ease-out-quart);
    }
    .blog-search:focus {
        outline: none;
        border-color: var(--color-primary-500);
    }
</style>