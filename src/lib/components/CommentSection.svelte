<script lang="ts">
    import { MessageCircle } from '@lucide/svelte';
    import type { LeafletComment } from '$lib/services/atproto/fetch';

    let { comments }: { comments: LeafletComment[] } = $props();
</script>

{#if comments.length > 0}
    <section class="comments-section">
        <h2 class="section-heading">
            <MessageCircle size={16} strokeWidth={2} />
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
        </h2>
        <ul class="comment-list">
            {#each comments as comment}
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

<style>
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
</style>
