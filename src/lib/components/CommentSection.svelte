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
{:else}
    <section class="comments-section">
        <h2 class="section-heading">
            <MessageCircle size={16} strokeWidth={2} />
            Comments
        </h2>
        <EmptyState
            title="No comments yet"
            description="Be the first to share your thoughts on this post."
            icon={false}
        />
    </section>
{/if}
