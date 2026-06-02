<script lang="ts">
    import ShareButtons from '$lib/components/ShareButtons.svelte';
    import SiteHead from '$lib/components/SiteHead.svelte';
    import TableOfContents from '$lib/components/TableOfContents.svelte';
    import EmptyState from '$lib/components/EmptyState.svelte';
    import LeafletBlocks from '$lib/components/leaflet/LeafletBlocks.svelte';
    import Pentacle from '$lib/components/icons/Pentacle.svelte';
    import { Rss, MessageCircle } from '@lucide/svelte';
    import { page } from '$app/state';

    let { data } = $props();

    /** Use native block rendering when blocks are available. */
    let useBlocks = $derived(data.post.blocks && data.post.blocks.length > 0);
</script>

<SiteHead title={data.post.title} description={data.post.metaDescription} />

<main class="shell-prose">
    <header class="post-hd">
        <h1 class="post-title">{data.post.title}</h1>
        <div class="post-meta">
            <time>{new Date(data.post.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
        </div>
    </header>

    <div class="post-layout">
        <aside class="post-sidebar">
            <TableOfContents container=\".prose\" />
        </aside>
        <div class="post-body">
            <article class=\"prose\">
                {#if useBlocks}
                    <LeafletBlocks blocks={data.post.blocks} />
                {:else}
                    {@html data.post.renderedContent}
                {/if}
            </article>

            <ShareButtons title={data.post.title} />

            <section class=\"comments-section\">
                {#if data.comments && data.comments.length > 0}
                    <h2 class=\"section-heading\">
                        <MessageCircle size={16} strokeWidth={2} />
                        Comments ({data.comments.length})
                    </h2>
                    <ul class=\"comment-list\">
                        {#each data.comments as comment}
                            <li class=\"comment-item\">
                                <div class=\"comment-meta\">
                                    {#if comment.authorDisplayName}
                                        <span class=\"comment-author\">{comment.authorDisplayName}</span>
                                    {/if}
                                    <a href=\"https://bsky.app/profile/{comment.authorDid}\" target=\"_blank\" rel=\"noopener\" class=\"comment-handle\">@{comment.authorHandle}</a>
                                    <time class=\"comment-date\">{new Date(comment.createdAt).toLocaleDateString()}</time>
                                </div>
                                <p class=\"comment-body\">{comment.plaintext}</p>
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <h2 class=\"section-heading\">
                        <MessageCircle size={16} strokeWidth={2} />
                        Comments
                    </h2>
                    <EmptyState
                        title=\"No comments yet\"
                        description=\"Be the first to share your thoughts on this post.\"
                        icon={false}
                    />
                {/if}
            </section>

            {#if data.blog}
                <footer class=\"post-footer\">
                    <p class=\"footer-pub\">
                        <a href={data.blog.url} target=\"_blank\" rel=\"noopener\">{data.blog.title}</a>
                    </p>
                    <p class=\"footer-desc\">{data.blog.description}</p>
                    <a href={data.blog.rss} target=\"_blank\" rel=\"noopener\" class=\"rss-link\"><Rss size={14} strokeWidth={2} /> RSS</a>
                </footer>
            {/if}
        </div>
    </div>
</main>
