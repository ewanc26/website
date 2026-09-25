<script lang="ts">
    import { normalizeSlug } from '$lib/utils/slugify';
    import { blogDateParts } from '$lib/utils/date';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import EmptyState from '$lib/components/EmptyState.svelte';
    import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';
    import { Rss, ArrowUpRight } from '@lucide/svelte';
    import { noiseAction } from '$lib/client/noise';

    let { data } = $props();

    type PostSummary = {
        title: string;
        createdAt: string;
        publicationRkey?: string;
        rkey: string;
        url: string;
        tags: string[];
        coverImage?: string;
    };

    let posts: PostSummary[] = $state([]);
    let hasMore = $state(false);
    let loading = $state(false);
    let searchQuery = $state('');

    $effect.pre(() => {
        posts = data.posts;
        hasMore = data.hasMore;
    });

    let filteredPosts = $derived(posts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ));

    let leadPost = $derived(filteredPosts[0]);
    let secondaryPosts = $derived(filteredPosts.slice(1, 5));
    let notebookPosts = $derived(filteredPosts.slice(5));

    function selectTopic(topic: string) {
        searchQuery = topic;
    }

    function getPostUrl(post: PostSummary) {
        const { year: y, month: m, day: d } = blogDateParts(post.createdAt);
        const slug = normalizeSlug(post.title);
        return `/blog/${y}/${m}/${d}/${slug}`;
    }

    function formatDate(date: string, options: Intl.DateTimeFormatOptions = {}) {
        return new Date(date).toLocaleDateString('en-gb', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options,
        });
    }

    function formatMonth(month: number) {
        return new Date(2000, month - 1, 1).toLocaleDateString('en-gb', { month: 'long' });
    }

    function groupPosts(items: PostSummary[]) {
        const grouped = new Map<number, Map<number, PostSummary[]>>();
        for (const post of items) {
            const { year, month } = blogDateParts(post.createdAt);
            const y = parseInt(year, 10);
            const m = parseInt(month, 10);
            if (!grouped.has(y)) grouped.set(y, new Map());
            const yearMap = grouped.get(y)!;
            if (!yearMap.has(m)) yearMap.set(m, []);
            yearMap.get(m)!.push(post);
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

<main class="shell-wide blog-index">
    <header class="blog-masthead animate-in">
        <div>
            <p class="eyebrow">ewancroft.uk / writing</p>
            <h1 class="page-title">Writing</h1>
            {#if data.blog?.description}
                <p class="page-desc">{data.blog.description}</p>
            {/if}
        </div>
        <div class="masthead-tools">
            <span class="archive-count">{data.total} posts / ATProto publication</span>
            {#if data.blog}
                <a href={data.blog.rss} target="_blank" rel="noopener" class="section-link active-press">
                    <Rss size={14} strokeWidth={2} /> RSS
                </a>
            {/if}
        </div>
    </header>

    <div class="index-toolbar">
        <label for="blog-search" class="sr-only">Search posts</label>
        <input
            id="blog-search"
            type="search"
            placeholder="Search by title or tag"
            bind:value={searchQuery}
            class="blog-search"
        />
    </div>

    {#if filteredPosts.length > 0}
        <section class="news-front animate-in" aria-label="Latest writing">
            <div class="front-lead">
                <a href={getPostUrl(leadPost)} class="lead-story active-press">
                    {#if leadPost.coverImage}
                        <img
                            class="lead-story-image"
                            src={leadPost.coverImage}
                            alt=""
                            width="1200"
                            height="630"
                            loading="eager"
                            decoding="async"
                        />
                    {:else}
                        <canvas
                            class="lead-story-image"
                            use:noiseAction={{
                                seed: `blog-lead:${leadPost.rkey}:${leadPost.title}`,
                                width: 1024,
                                height: 1024,
                            }}
                            aria-hidden="true"
                        ></canvas>
                    {/if}
                    <div class="story-kicker">
                        {#if leadPost.tags.length > 0}
                            {leadPost.tags[0]}
                        {:else}
                            Latest
                        {/if}
                    </div>
                    <h2>{leadPost.title}</h2>
                    <div class="story-meta">
                        <time datetime={leadPost.createdAt}>{formatDate(leadPost.createdAt)}</time>
                        <span>Read article <ArrowUpRight size={14} strokeWidth={2} /></span>
                    </div>
                </a>
            </div>

            {#if secondaryPosts.length > 0}
                <div class="secondary-grid">
                    {#each secondaryPosts as post}
                        <a href={getPostUrl(post)} class="secondary-story active-press">
                            <div class="story-kicker">
                                {#if post.tags.length > 0}
                                    {post.tags[0]}
                                {:else}
                                    Writing
                                {/if}
                            </div>
                            <h3>{post.title}</h3>
                            <time datetime={post.createdAt}>{formatDate(post.createdAt)}</time>
                        </a>
                    {/each}
                </div>
            {/if}
        </section>

        {#if notebookPosts.length > 0}
            <section class="latest-section animate-in" aria-labelledby="notebook-heading">
                <div class="section-heading">
                    <div>
                        <p class="section-kicker">The notebook</p>
                        <h2 id="notebook-heading">Recent writing</h2>
                    </div>
                    <span>{filteredPosts.length} shown</span>
                </div>
                <div class="latest-list">
                    {#each notebookPosts as post}
                        <a href={getPostUrl(post)} class="latest-story active-press">
                            <span class="latest-date">
                                <time datetime={post.createdAt}>{formatDate(post.createdAt, { day: '2-digit', month: 'short' })}</time>
                                {#if post.tags.length > 0}
                                    <span>{post.tags[0]}</span>
                                {/if}
                            </span>
                            <span class="latest-title">{post.title}</span>
                            <ArrowUpRight class="latest-arrow" size={16} strokeWidth={2} />
                        </a>
                    {/each}
                </div>
            </section>
        {/if}

        {#if data.topics?.length > 0}
            <section class="topics-section animate-in" aria-labelledby="topics-heading">
                <div class="section-heading">
                    <div>
                        <p class="section-kicker">Explore</p>
                        <h2 id="topics-heading">Topics</h2>
                    </div>
                    <span>From the publication records</span>
                </div>
                <div class="topic-groups">
                    {#each data.topics as group}
                        <div class="topic-group">
                            <div class="topic-group-heading">
                                <button
                                    type="button"
                                    class:topic-active={searchQuery.toLowerCase() === group.name.toLowerCase()}
                                    class="topic-root active-press"
                                    onclick={() => selectTopic(group.name)}
                                >
                                    <span>{group.name}</span>
                                    <strong>{group.count}</strong>
                                </button>
                                <span>related</span>
                            </div>
                            <div class="topic-list">
                                {#each group.tags.slice(1) as topic}
                                    <button
                                        type="button"
                                        class:topic-active={searchQuery.toLowerCase() === topic.name.toLowerCase()}
                                        class="topic-link active-press"
                                        onclick={() => selectTopic(topic.name)}
                                    >
                                        <span>{topic.name}</span>
                                        <strong>{topic.count}</strong>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>

                {#if data.ungroupedTopics?.length > 0}
                    <div class="topic-more">
                        <p class="section-kicker">More topics</p>
                        <div class="topic-list">
                            {#each data.ungroupedTopics as topic}
                                <button
                                    type="button"
                                    class:topic-active={searchQuery.toLowerCase() === topic.name.toLowerCase()}
                                    class="topic-link active-press"
                                    onclick={() => selectTopic(topic.name)}
                                >
                                    <span>{topic.name}</span>
                                    <strong>{topic.count}</strong>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
            </section>
        {/if}

        {#if hasMore}
            <div class="load-more animate-in">
                {#if loading}
                    <LoadingSkeleton count={2} label="Loading more posts" />
                {:else}
                    <button onclick={loadMore} type="button" class="active-press">Load more</button>
                {/if}
            </div>
        {/if}

        {#if data.archive?.length > 0 && !searchQuery}
            <section class="archive-section animate-in" aria-labelledby="archive-heading">
                <div class="section-heading">
                    <div>
                        <p class="section-kicker">The archive</p>
                        <h2 id="archive-heading">By year</h2>
                    </div>
                    <span>{data.total} posts</span>
                </div>
                {#each data.archive as yearGroup}
                    <div class="archive-year">
                        <h3>{yearGroup.year}</h3>
                        <div class="archive-months">
                            {#each yearGroup.months as month}
                                <div class="archive-month">
                                    <span>{formatMonth(month.month)}</span>
                                    <strong>{month.count}</strong>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </section>
        {/if}
    {:else if searchQuery}
        <EmptyState title="No matching posts" description="Try a different title or tag." icon={false} />
    {:else}
        <EmptyState
            title="No posts available"
            description="Unable to load blog posts at the moment. The publishing service may be temporarily unavailable. Please try again later."
        />
    {/if}
</main>

<style>
    .blog-index {
        padding-bottom: var(--space-2xl);
    }

    .blog-masthead {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: var(--space-xl);
        padding: clamp(2.5rem, 7vw, 5rem) 0 var(--space-lg);
        border-bottom: 4px solid var(--color-text-950);
    }

    .eyebrow,
    .story-kicker {
        margin: 0 0 var(--space-xs);
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--color-primary-600);
    }

    .blog-masthead .page-title {
        margin: 0;
        font-size: clamp(2.75rem, 8vw, 6rem);
        line-height: 0.9;
        letter-spacing: -0.065em;
    }

    .blog-masthead .page-desc {
        max-width: 55ch;
        margin: var(--space-md) 0 0;
        color: var(--color-text-700);
        font-size: var(--text-md);
    }

    .masthead-tools {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        flex-shrink: 0;
        padding-bottom: 0.15rem;
    }

    .archive-count {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-600);
        white-space: nowrap;
    }

    .index-toolbar {
        padding: var(--space-md) 0;
        border-bottom: 1px solid var(--surface-color);
    }

    .blog-search {
        width: 100%;
        padding: var(--space-sm) var(--space-3);
        border: 1px solid var(--surface-color);
        border-radius: var(--radius-md);
        background: var(--surface-raised);
        font-size: var(--text-sm);
    }

    .blog-search:focus {
        border-color: var(--color-primary-500);
    }

    .news-front {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(18rem, 1fr);
        gap: 0;
        margin-top: var(--space-xl);
        border-top: 1px solid var(--surface-color);
        border-bottom: 1px solid var(--surface-color);
    }

    .front-lead {
        min-width: 0;
        border-right: 1px solid var(--surface-color);
    }

    .lead-story {
        display: flex;
        min-height: 25rem;
        flex-direction: column;
        justify-content: flex-end;
        padding: clamp(var(--space-lg), 5vw, var(--space-xl));
        background: var(--surface-raised);
        color: inherit;
        text-decoration: none;
    }

    .lead-story-image {
        width: calc(100% + 2 * clamp(var(--space-lg), 5vw, var(--space-xl)));
        aspect-ratio: 1200 / 630;
        margin: calc(-1 * clamp(var(--space-lg), 5vw, var(--space-xl))) calc(-1 * clamp(var(--space-lg), 5vw, var(--space-xl))) var(--space-lg);
        overflow: hidden;
        border-bottom: 1px solid var(--surface-color);
    }

    .lead-story-image :is(img, canvas) {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .lead-story h2 {
        max-width: 12ch;
        margin: 0;
        font-size: clamp(2rem, 4.5vw, 4rem);
        line-height: 0.98;
        letter-spacing: -0.055em;
    }

    .story-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        margin-top: var(--space-xl);
        padding-top: var(--space-sm);
        border-top: 1px solid var(--surface-color);
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-600);
    }

    .story-meta span {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2xs);
        color: var(--color-text-800);
    }

    .secondary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }

    .secondary-story {
        min-height: 12.5rem;
        padding: var(--space-lg);
        color: inherit;
        text-decoration: none;
        border-bottom: 1px solid var(--surface-color);
        background: var(--color-background-50);
    }

    .secondary-story:nth-child(odd) {
        border-right: 1px solid var(--surface-color);
    }

    .secondary-story h3 {
        margin: 0 0 var(--space-lg);
        font-size: clamp(1.15rem, 2vw, 1.5rem);
        line-height: 1.08;
        letter-spacing: -0.025em;
    }

    .secondary-story time {
        font-family: var(--font-mono);
        font-size: 0.7rem;
        color: var(--color-text-600);
    }

    .lead-story:is(:hover, :focus-visible),
    .secondary-story:is(:hover, :focus-visible),
    .latest-story:is(:hover, :focus-visible) {
        background: color-mix(in oklch, var(--color-primary-500) 10%, var(--surface-sunken));
        color: var(--color-text-950);
        text-decoration: none;
    }

    .latest-section,
    .archive-section {
        margin-top: clamp(2.5rem, 7vw, 5rem);
    }

    .section-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-md);
        padding-bottom: var(--space-sm);
        border-bottom: 4px solid var(--color-text-950);
    }

    .section-kicker {
        margin: 0 0 var(--space-2xs);
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--color-primary-600);
    }

    .section-heading h2 {
        margin: 0;
        font-size: clamp(1.5rem, 3vw, 2.25rem);
        letter-spacing: -0.04em;
    }

    .section-heading > span {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-600);
    }

    .latest-list {
        border-bottom: 1px solid var(--surface-color);
    }

    .latest-story {
        display: grid;
        grid-template-columns: 8rem minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--space-lg);
        padding: var(--space-md) var(--space-sm);
        border-bottom: 1px solid var(--surface-color);
        color: inherit;
        text-decoration: none;
    }

    .latest-date {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs);
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-600);
    }

    .latest-date span {
        color: var(--color-primary-600);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .latest-title {
        font-size: clamp(1rem, 2vw, 1.3rem);
        font-weight: 650;
        line-height: 1.25;
        color: var(--color-text-950);
    }

    .latest-arrow {
        color: var(--color-text-500);
        flex-shrink: 0;
    }

    .load-more {
        display: flex;
        justify-content: center;
        padding-top: var(--space-xl);
    }

    .archive-year {
        display: grid;
        grid-template-columns: 8rem minmax(0, 1fr);
        gap: var(--space-lg);
        padding: var(--space-md) 0;
        border-bottom: 1px solid var(--surface-color);
    }

    .archive-year h3 {
        margin: 0;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
    }

    .archive-months {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs);
    }

    .archive-month {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-xs) var(--space-sm);
        border: 1px solid var(--surface-color);
        border-radius: var(--radius-sm);
        background: var(--surface-raised);
        font: inherit;
        font-size: var(--text-sm);
    }

    .archive-month strong {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-600);
    }

    .topics-section {
        margin-top: clamp(2.5rem, 7vw, 5rem);
    }

    .topic-groups {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-md);
        padding-top: var(--space-md);
    }

    .topic-group {
        padding: var(--space-md);
        border: 1px solid var(--surface-color);
        background: var(--surface-raised);
    }

    .topic-group-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm);
        padding-bottom: var(--space-sm);
        border-bottom: 1px solid var(--surface-color);
    }

    .topic-group-heading > span {
        font-family: var(--font-mono);
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-text-500);
    }

    .topic-root {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding: 0;
        border: 0;
        background: none;
        color: var(--color-text-950);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }

    .topic-root strong {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-600);
    }

    .topic-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs);
        padding-top: var(--space-sm);
    }

    .topic-link {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-xs) var(--space-sm);
        border: 1px solid var(--surface-color);
        border-radius: var(--radius-sm);
        background: var(--surface-raised);
        color: inherit;
        font: inherit;
        font-size: var(--text-sm);
        cursor: pointer;
    }

    .topic-link strong {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-600);
    }

    .topic-more {
        margin-top: var(--space-md);
    }

    .topic-link.topic-active {
        border-color: var(--color-primary-500);
        background: color-mix(in oklch, var(--color-primary-500) 10%, var(--surface-sunken));
    }

    @media (max-width: 760px) {
        .topic-groups {
            grid-template-columns: 1fr;
        }
        .blog-masthead {
            align-items: flex-start;
            flex-direction: column;
        }

        .masthead-tools {
            width: 100%;
            justify-content: space-between;
        }

        .news-front {
            grid-template-columns: 1fr;
        }

        .front-lead {
            border-right: none;
            border-bottom: 1px solid var(--surface-color);
        }

        .lead-story {
            min-height: 20rem;
        }
    }

    @media (max-width: 560px) {
        .blog-masthead .page-title {
            font-size: clamp(2.75rem, 16vw, 4rem);
        }

        .secondary-grid {
            grid-template-columns: 1fr;
        }

        .secondary-story,
        .secondary-story:nth-child(odd) {
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid var(--surface-color);
        }

        .latest-story {
            grid-template-columns: 5.5rem minmax(0, 1fr) auto;
            gap: var(--space-sm);
            padding-inline: 0;
        }

        .archive-year {
            grid-template-columns: 1fr;
            gap: var(--space-sm);
        }
    }
</style>
