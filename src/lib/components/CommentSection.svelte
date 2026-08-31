<script lang="ts">
    import { onMount } from 'svelte';
    import { MessageCircle, Reply, Send, LogIn, LogOut } from '@lucide/svelte';
    import EmptyState from '$lib/components/EmptyState.svelte';
    import type { LeafletComment } from '$lib/services/atproto/fetch';
    import {
        initReaderSession,
        publishLeafletComment,
        signInReader,
        signOutReader,
        type ReaderSession,
    } from '$lib/services/atproto/commentClient';

    let {
        comments,
        subjectUri,
    }: {
        comments: LeafletComment[];
        subjectUri: string;
    } = $props();

    let readerSession = $state<ReaderSession | null>(null);
    let identifier = $state('');
    let draft = $state('');
    let replyingTo = $state<LeafletComment | null>(null);
    let busy = $state(false);
    let authReady = $state(false);
    let error = $state('');
    let notice = $state('');
    let localComments = $state<LeafletComment[]>([]);

    onMount(() => {
        void (async () => {
            try {
                readerSession = await initReaderSession();
                if (readerSession) identifier = readerSession.handle;
            } catch (cause) {
                error = cause instanceof Error ? cause.message : 'Could not restore AT Protocol sign-in.';
            } finally {
                authReady = true;
            }
        })();
    });

    let allComments = $derived([...comments, ...localComments]);
    let threadedComments = $derived(buildThread(allComments));

    function buildThread(items: LeafletComment[]) {
        const byUri = new Map(items.map((comment) => [comment.uri, comment]));
        const children = new Map<string, LeafletComment[]>();
        const roots: LeafletComment[] = [];

        for (const comment of items) {
            const parent = comment.reply?.parent;
            if (parent && byUri.has(parent) && parent !== comment.uri) {
                const list = children.get(parent) ?? [];
                list.push(comment);
                children.set(parent, list);
            } else {
                roots.push(comment);
            }
        }

        const output: Array<{ comment: LeafletComment; depth: number }> = [];
        const seen = new Set<string>();
        const visit = (comment: LeafletComment, depth: number) => {
            if (seen.has(comment.uri)) return;
            seen.add(comment.uri);
            output.push({ comment, depth: Math.min(depth, 6) });
            for (const child of children.get(comment.uri) ?? []) visit(child, depth + 1);
        };

        for (const root of roots) visit(root, 0);
        for (const comment of items) visit(comment, 0);
        return output;
    }

    async function signIn() {
        error = '';
        notice = '';
        busy = true;
        try {
            const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
            await signInReader(identifier, returnTo);
        } catch (cause) {
            error = cause instanceof Error ? cause.message : 'Could not start AT Protocol sign-in.';
            busy = false;
        }
    }

    async function signOut() {
        if (!readerSession) return;
        error = '';
        notice = '';
        busy = true;
        try {
            await signOutReader(readerSession);
            readerSession = null;
            replyingTo = null;
            notice = 'Signed out from commenting.';
        } catch (cause) {
            error = cause instanceof Error ? cause.message : 'Could not sign out.';
        } finally {
            busy = false;
        }
    }

    async function submitComment() {
        if (!readerSession) return;
        error = '';
        notice = '';
        busy = true;
        const text = draft.trim();
        const parent = replyingTo?.uri;

        try {
            const created = await publishLeafletComment(readerSession, subjectUri, text, parent);
            localComments = [
                ...localComments,
                {
                    uri: created.uri,
                    plaintext: text,
                    createdAt: new Date().toISOString(),
                    authorDid: readerSession.did,
                    authorHandle: readerSession.handle,
                    reply: parent ? { parent } : undefined,
                },
            ];
            draft = '';
            replyingTo = null;
            notice = 'Comment published to your AT Protocol repository. It may take a moment to appear in other Leaflet readers.';
        } catch (cause) {
            error = cause instanceof Error ? cause.message : 'Could not publish the comment.';
        } finally {
            busy = false;
        }
    }

    function startReply(comment: LeafletComment) {
        replyingTo = comment;
        error = '';
        notice = '';
        queueMicrotask(() => document.querySelector<HTMLTextAreaElement>('#leaflet-comment-draft')?.focus());
    }
</script>

<section class="comments-section" aria-labelledby="comments-heading">
    <h2 class="section-heading" id="comments-heading">
        <MessageCircle size={16} strokeWidth={2} />
        {allComments.length > 0 ? `${allComments.length} comment${allComments.length !== 1 ? 's' : ''}` : 'Comments'}
    </h2>

    <div class="comment-composer">
        {#if readerSession}
            <div class="comment-session-row">
                <span>Commenting as <strong>@{readerSession.handle}</strong></span>
                <button type="button" class="comment-link-button" onclick={() => void signOut()} disabled={busy}>
                    <LogOut size={14} aria-hidden="true" /> Sign out
                </button>
            </div>

            {#if replyingTo}
                <div class="replying-to">
                    <span>Replying to <strong>@{replyingTo.authorHandle}</strong></span>
                    <button type="button" class="comment-link-button" onclick={() => (replyingTo = null)}>Cancel</button>
                </div>
            {/if}

            <label class="sr-only" for="leaflet-comment-draft">Your comment</label>
            <textarea
                id="leaflet-comment-draft"
                bind:value={draft}
                rows="4"
                placeholder={replyingTo ? `Reply to @${replyingTo.authorHandle}…` : 'Share your thoughts…'}
                disabled={busy}
            ></textarea>
            <div class="composer-actions">
                <span class="composer-note">Published as a <code>pub.leaflet.comment</code> record in your own repo.</span>
                <button type="button" class="comment-primary-button" onclick={submitComment} disabled={busy || !draft.trim()}>
                    <Send size={14} aria-hidden="true" /> {busy ? 'Publishing…' : 'Publish comment'}
                </button>
            </div>
        {:else if !authReady}
            <p class="composer-note" role="status">Checking AT Protocol sign-in…</p>
        {:else}
            <form class="comment-signin" onsubmit={(event) => { event.preventDefault(); void signIn(); }}>
                <div class="comment-signin-fields">
                    <label>
                        <span>AT Protocol handle</span>
                        <input bind:value={identifier} autocomplete="username" placeholder="you.example.com" disabled={busy} required />
                    </label>
                </div>
                <div class="composer-actions">
                    <span class="composer-note">Sign in with AT Protocol OAuth. This reader only requests permission to create <code>pub.leaflet.comment</code> records in your repo; your password is never shared with this site.</span>
                    <button type="submit" class="comment-primary-button" disabled={busy || !identifier.trim()}>
                        <LogIn size={14} aria-hidden="true" /> {busy ? 'Opening sign-in…' : 'Sign in to comment'}
                    </button>
                </div>
            </form>
        {/if}

        {#if error}<p class="comment-status comment-status--error" role="alert">{error}</p>{/if}
        {#if notice}<p class="comment-status" role="status">{notice}</p>{/if}
    </div>

    {#if threadedComments.length > 0}
        <ul class="comment-list">
            {#each threadedComments as entry}
                <li class="comment" style={`--comment-depth:${entry.depth}`}>
                    <div class="comment-head">
                        <strong>{entry.comment.authorDisplayName ?? entry.comment.authorHandle}</strong>
                        <a href={`https://bsky.app/profile/${encodeURIComponent(entry.comment.authorDid)}`} target="_blank" rel="noopener noreferrer" class="comment-handle">@{entry.comment.authorHandle}</a>
                        <time class="comment-date" datetime={entry.comment.createdAt}>{new Date(entry.comment.createdAt).toLocaleDateString('en-gb', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                    </div>
                    <p class="comment-body">{entry.comment.plaintext}</p>
                    {#if readerSession}
                        <button type="button" class="comment-reply-button" onclick={() => startReply(entry.comment)}>
                            <Reply size={13} aria-hidden="true" /> Reply
                        </button>
                    {/if}
                </li>
            {/each}
        </ul>
    {:else}
        <EmptyState
            title="No comments yet"
            description="Be the first to share your thoughts on this post."
            icon={false}
        />
    {/if}
</section>

<style>
    .comment-composer {
        margin: 0 0 1.5rem;
        padding: 1rem;
        border: 1px solid var(--border-subtle, currentColor);
        border-radius: 0.75rem;
    }

    .comment-session-row,
    .replying-to,
    .composer-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
    }

    .replying-to {
        margin: 0.65rem 0;
        font-size: 0.875rem;
    }

    textarea,
    input {
        box-sizing: border-box;
        width: 100%;
        border: 1px solid var(--border-subtle, currentColor);
        border-radius: 0.5rem;
        background: var(--surface, transparent);
        color: inherit;
        font: inherit;
    }

    textarea {
        margin: 0.75rem 0;
        padding: 0.75rem;
        resize: vertical;
    }

    input { padding: 0.6rem 0.7rem; }

    .comment-signin-fields {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 0.75rem;
        margin-bottom: 0.75rem;
    }

    .comment-signin-fields label {
        display: grid;
        gap: 0.35rem;
        font-size: 0.85rem;
        font-weight: 600;
    }

    .comment-primary-button,
    .comment-link-button,
    .comment-reply-button {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font: inherit;
        cursor: pointer;
    }

    .comment-primary-button {
        flex: none;
        padding: 0.55rem 0.8rem;
        border: 1px solid currentColor;
        border-radius: 0.5rem;
        background: transparent;
        color: inherit;
        font-weight: 650;
    }

    .comment-primary-button:disabled,
    .comment-link-button:disabled { opacity: 0.55; cursor: not-allowed; }

    .comment-link-button,
    .comment-reply-button {
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        text-decoration: underline;
        text-underline-offset: 0.16em;
    }

    .comment-reply-button {
        margin-top: 0.35rem;
        font-size: 0.82rem;
        opacity: 0.75;
    }

    .composer-note,
    .comment-status {
        margin: 0;
        font-size: 0.8rem;
        opacity: 0.72;
    }

    .composer-note { max-width: 42rem; }
    .comment-status { margin-top: 0.75rem; }
    .comment-status--error { opacity: 1; }

    .comment-list .comment {
        margin-inline-start: min(calc(var(--comment-depth, 0) * 1.25rem), 7.5rem);
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    @media (max-width: 640px) {
        .composer-actions { align-items: flex-start; flex-direction: column; }
        .comment-list .comment { margin-inline-start: min(calc(var(--comment-depth, 0) * 0.75rem), 3rem); }
    }
</style>
