<script lang="ts">
    import { normalizeSlug } from '$lib/utils/slugify';
    import { blogDateParts } from '$lib/utils/date';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import EmptyState from '$lib/components/EmptyState.svelte';
    import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';
    import { Rss, ArrowUpRight } from '@lucide/svelte';
    import { noiseAction } from '@ewanc26/noise';

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

    // Derived from the load data so the server render already has posts
    // (an effect never runs during SSR). Search and "load more" override
    // them locally; new load data resets them.
    let posts: PostSummary[] = $derived(data.posts);
    let hasMore = $derived(data.hasMore);
    let total = $derived(data.total);
    let loading = $state(false);
    let searching = $state(false);
    let searchQuery = $state('');
    let searchRequestId = 0;

    let filteredPosts = $derived(posts);
    let isSearching = $derived(searchQuery.trim().length > 0);

    // The editorial front page only makes sense for the unfiltered archive;
    // search results read better as a single scannable list.
    let leadPost = $derived(isSearching ? undefined : filteredPosts[0]);
    let secondaryPosts = $derived(isSearching ? [] : filteredPosts.slice(1, 5));
    let notebookPosts = $derived(isSearching ? filteredPosts : filteredPosts.slice(5));

    async function searchPosts(query: string) {
        const requestId = ++searchRequestId;
        const trimmedQuery = query.trim();
        searchQuery = query;

        if (!trimmedQuery) {
            posts = data.posts;
            hasMore = data.hasMore;
            total = data.total;
            searching = false;
            return;
        }

        searching = true;
        try {
            const params = new URLSearchParams({
                q: trimmedQuery,
                offset: '0',
                limit: String(data.pageSize),
            });
            const res = await fetch(`/api/blog/posts?${params}`);
            if (!res.ok) throw new Error(`Blog API returned ${res.status}`);
            const result = await res.json();

            if (requestId !== searchRequestId) return;
            posts = result.posts;
            total = result.total;
            hasMore = posts.length < result.total;
        } catch (error) {
            if (requestId === searchRequestId) {
                console.error('Failed to search blog posts', error);
                posts = [];
                total = 0;
                hasMore = false;
            }
        } finally {
            if (requestId === searchRequestId) searching = false;
        }
    }

    function selectTopic(topic: string) {
        void searchPosts(topic);
        document.getElementById('blog-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function isActiveTopic(topic: string) {
        return searchQuery.trim().toLowerCase() === topic.toLowerCase();
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

    async function loadMore() {
        if (loading || !hasMore) return;
        loading = true;
        try {
            const params = new URLSearchParams({
                offset: String(posts.length),
                limit: String(data.pageSize),
            });
            if (searchQuery.trim()) params.set('q', searchQuery.trim());
            const res = await fetch(`/api/blog/posts?${params}`);
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

    <div class="index-toolbar" aria-busy={searching}>
        <label for="blog-search" class="sr-only">Search posts</label>
        <input
            id="blog-search"
            type="search"
            placeholder="Search by title or tag"
            bind:value={searchQuery}
            oninput={(event) => void searchPosts(event.currentTarget.value)}
            class="blog-search"
        />
        {#if isSearching}
            <p class="search-status" aria-live="polite">
                {#if searching}
                    Searching…
                {:else}
                    {total} {total === 1 ? 'result' : 'results'}
                {/if}
            </p>
        {/if}
    </div>

    {#if filteredPosts.length > 0}
        {#if leadPost}
        <section class="news-front animate-in" class:news-front--solo={secondaryPosts.length === 0} aria-label="Latest writing">
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
                                width: 1200,
                                height: 630,
                                octaves: 3,
                                gridSize: 5,
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
        {/if}

        {#if notebookPosts.length > 0}
            <section class="latest-section animate-in" aria-labelledby="notebook-heading">
                <div class="section-heading">
                    <div>
                        <p class="section-kicker">{isSearching ? 'Search' : 'The notebook'}</p>
                        <h2 id="notebook-heading">{isSearching ? `Matching “${searchQuery.trim()}”` : 'Recent writing'}</h2>
                    </div>
                    <span>{filteredPosts.length} of {total}</span>
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
                            <span class="latest-arrow"><ArrowUpRight size={16} strokeWidth={2} /></span>
                        </a>
                    {/each}
                </div>

                {#if hasMore}
                    <div class="load-more">
                        {#if loading}
                            <LoadingSkeleton count={2} label="Loading more posts" />
                        {:else}
                            <button onclick={loadMore} type="button" class="active-press">Load more</button>
                        {/if}
                    </div>
                {/if}
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
                                    class:topic-active={isActiveTopic(group.name)}
                                    class="topic-root active-press"
                                    onclick={() => selectTopic(group.name)}
                                >
                                    <span>{group.name}</span>
                                    <strong>{group.count}</strong>
                                </button>
                                <span>{group.tags.length - 1} related</span>
                            </div>
                            <div class="topic-list">
                                {#each group.tags.slice(1) as topic}
                                    <button
                                        type="button"
                                        class:topic-active={isActiveTopic(topic.name)}
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
                                    class:topic-active={isActiveTopic(topic.name)}
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

        {#if data.archive?.length > 0 && !isSearching}
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

    .masthead-tools .section-link {
        margin-top: 0;
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

    .search-status {
        margin: var(--space-xs) 0 0;
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-600);
    }

    .news-front {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(18rem, 1fr);
        gap: 0;
        margin-top: var(--space-xl);
        border-top: 1px solid var(--surface-color);
    }

    .news-front--solo {
        grid-template-columns: minmax(0, 1fr);
    }

    .front-lead {
        min-width: 0;
        border-right: 1px solid var(--surface-color);
        border-bottom: 1px solid var(--surface-color);
    }

    .news-front--solo .front-lead {
        border-right: none;
    }

    .lead-story {
        --lead-pad: clamp(var(--space-lg), 5vw, var(--space-xl));
        display: flex;
        height: 100%;
        min-height: 25rem;
        flex-direction: column;
        padding: var(--lead-pad);
        background: var(--surface-raised);
        color: inherit;
        text-decoration: none;
    }

    /* Bleed the artwork to the card edges, cancelling the card padding. */
    .lead-story-image {
        display: block;
        width: calc(100% + 2 * var(--lead-pad));
        max-width: none;
        height: auto;
        aspect-ratio: 1200 / 630;
        margin: calc(-1 * var(--lead-pad)) calc(-1 * var(--lead-pad)) var(--space-lg);
        object-fit: cover;
        border-bottom: 1px solid var(--surface-color);
    }

    .lead-story h2 {
        max-width: 18ch;
        margin: 0 0 var(--space-xl);
        font-size: clamp(1.9rem, 4vw, 3.25rem);
        line-height: 1;
        letter-spacing: -0.045em;
        text-wrap: balance;
    }

    .story-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        margin-top: auto;
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
        grid-auto-rows: 1fr;
    }

    .secondary-story {
        min-height: 12.5rem;
        padding: var(--space-lg);
        color: inherit;
        text-decoration: none;
        border-bottom: 1px solid var(--surface-color);
        background: var(--color-background-50);
        transition: background-color var(--duration-fast) var(--ease-out-quart);
    }

    .secondary-story:nth-child(odd) {
        border-right: 1px solid var(--surface-color);
    }

    /* An odd final story spans the row rather than leaving an empty cell. */
    .secondary-story:last-child:nth-child(odd) {
        grid-column: 1 / -1;
        border-right: none;
    }

    .secondary-story h3 {
        margin: 0 0 var(--space-lg);
        font-size: clamp(1.15rem, 2vw, 1.5rem);
        line-height: 1.08;
        letter-spacing: -0.025em;
        text-wrap: balance;
    }

    .secondary-story time {
        font-family: var(--font-mono);
        font-size: 0.7rem;
        color: var(--color-text-600);
    }

    .lead-story:is(:hover, :focus-visible),
    .secondary-story:is(:hover, :focus-visible),
    .latest-story:is(:hover, :focus-visible),
    .topic-link:is(:hover, :focus-visible) {
        background: color-mix(in oklch, var(--color-primary-500) 10%, var(--surface-sunken));
        color: var(--color-text-950);
        text-decoration: none;
    }

    .latest-section,
    .archive-section {
        margin-top: clamp(2.5rem, 7vw, 5rem);
    }

    /* Reset the global .section-heading label style from content.css. */
    .section-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-md);
        margin: 0;
        padding-bottom: var(--space-sm);
        font-size: inherit;
        font-weight: inherit;
        letter-spacing: normal;
        text-transform: none;
        color: inherit;
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
        transition: background-color var(--duration-fast) var(--ease-out-quart);
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
        display: inline-flex;
        color: var(--color-text-500);
        flex-shrink: 0;
    }

    .latest-story:is(:hover, :focus-visible) .latest-arrow {
        color: var(--color-primary-600);
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

    .topic-root:is(:hover, :focus-visible),
    .topic-root.topic-active {
        background: none;
        color: var(--color-primary-600);
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
        font-weight: 400;
        cursor: pointer;
        transition:
            background-color var(--duration-fast) var(--ease-out-quart),
            border-color var(--duration-fast) var(--ease-out-quart);
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

    @media (max-width: 900px) {
        .news-front {
            grid-template-columns: 1fr;
        }

        .front-lead {
            border-right: none;
        }

        .lead-story {
            min-height: 0;
        }
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

    }

    @media (max-width: 560px) {
        .blog-masthead .page-title {
            font-size: clamp(2.75rem, 16vw, 4rem);
        }

        .secondary-grid {
            grid-template-columns: 1fr;
            grid-auto-rows: auto;
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
