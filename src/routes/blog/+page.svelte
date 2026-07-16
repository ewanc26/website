<script lang="ts">
    import { normalizeSlug } from '$lib/utils/slugify';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import EmptyState from '$lib/components/EmptyState.svelte';
    import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';
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
        return new Date(2000, month - 1, 1).toLocaleDateString('en-gb', { month: 'long' });
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
            if (!res.ok) throw new Error(`Blog API returned ${res.status}`);
            const result = await res.json();
            posts = [...posts, ...result.posts];
            hasMore = posts.length < result.total;
        } catch (error) {
            console.error('Failed to load more posts', error);
        } finally {
            loading = false;
        }
    }
</script>

<SiteHead title={data.blog?.title ?? 'Blog'} description={data.blog?.description} ogType="BLOG" />

<main class="shell-wide">
    <header class="page-hd animate-in">
        <h1 class="page-title">{data.blog?.title ?? 'Blog'}</h1>
        {#if data.blog}
            <div class="page-hd-meta">
                <p class="page-desc">{data.blog.description}</p>
                <div class="page-hd-actions">
                    <span class="archive-count">{data.total} posts</span>
                    <a href={data.blog.rss} target="_blank" rel="noopener" class="section-link hover-lift active-press"><Rss size={14} strokeWidth={2} /> RSS</a>
                </div>
            </div>
        {/if}
        <label for="blog-search" class="sr-only">Search posts</label>
        <input
            id="blog-search"
            type="search" 
            placeholder="Search by title or tag"
            bind:value={searchQuery}
            class="blog-search"
        />
    </header>

    {#if filteredPosts.length > 0}
        {#each groupPosts(filteredPosts) as [year, months], i}
            <div class="year-head animate-in" style="animation-delay: {100 + i * 100}ms">{year}</div>
            {#each Array.from(months.entries()).sort((a, b) => b[0] - a[0]) as [month, monthPosts]}
                <div class="month-label">{formatMonth(month)}</div>
                <ul class="post-list post-list--dense content-reveal-list">
                    {#each monthPosts as post}
                        <li>
                            <a href={getPostUrl(post)} class="post-row post-row--product hover-lift active-press">
                                <span class="row-stack post-summary">
                                    <span class="post-title">{post.title}</span>
                                    {#if post.tags.length > 0}
                                        <span class="post-tags" aria-label={`Tags: ${post.tags.slice(0, 3).join(', ')}`}>
                                            {#each post.tags.slice(0, 3) as tag}
                                                <span class="post-tag">{tag}</span>
                                            {/each}
                                        </span>
                                    {/if}
                                </span>
                                <time class="post-date">{new Date(post.createdAt).toLocaleDateString('en-gb', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                            </a>
                        </li>
                    {/each}
                </ul>
            {/each}
        {/each}

        {#if hasMore}
            <div class="load-more animate-in stagger-2">
                {#if loading}
                    <LoadingSkeleton count={2} label="Loading more posts" />
                {:else}
                    <button
                        onclick={loadMore}
                        type="button"
                        class="active-press"
                    >
                        Load more
                    </button>
                {/if}
            </div>
        {/if}
    {:else if searchQuery}
        <EmptyState
            title="No matching posts"
            description="Try a different title or tag."
            icon={false}
        />
    {:else}
        <EmptyState
            title="No posts available"
            description="Unable to load blog posts at the moment. The publishing service may be temporarily unavailable. Please try again later."
        />
    {/if}
</main>
<style>
    .page-hd-meta {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-md);
    }
    .page-hd-actions {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: var(--space-sm);
    }
    .archive-count {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-600);
    }
    .page-hd-actions .section-link {
        margin-top: 0;
    }
    .blog-search {
        margin-top: var(--space-md);
        width: 100%;
        padding: var(--space-sm) var(--space-3);
        border: 1px solid var(--surface-color);
        border-radius: var(--radius-md);
        background: var(--surface-raised);
        box-sizing: border-box;
        transition: border-color var(--duration-fast) var(--ease-out-quart);
        font-size: var(--text-sm);
    }
    .blog-search:focus {
        border-color: var(--color-primary-500);
    }
    .post-list--dense {
        gap: var(--space-2xs);
    }
    .post-row--product {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--text-sm);
        border-radius: var(--radius-sm);
        border-bottom: none;
        background: var(--surface-raised);
        border: 1px solid transparent;
    }
    .post-row--product:hover {
        border-color: var(--surface-color);
        background: var(--color-background-50);
    }
    .post-summary {
        min-width: 0;
        gap: var(--space-2xs);
    }
    .post-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2xs);
        font-family: var(--font-mono);
        font-size: 0.625rem;
        line-height: 1.4;
        color: var(--color-text-600);
    }
    .post-tag + .post-tag::before {
        content: '\00b7';
        margin-right: var(--space-2xs);
        color: var(--color-text-400);
    }
    @media (max-width: 560px) {
        .page-hd-meta {
            align-items: flex-start;
            flex-direction: column;
            gap: var(--space-xs);
        }
        .post-row--product {
            align-items: flex-start;
            flex-direction: column;
            gap: var(--space-xs);
        }
    }
</style>
