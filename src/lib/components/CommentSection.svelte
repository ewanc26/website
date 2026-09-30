<script lang="ts">
  /**
   * The flagship reactivity rewrite of this migration: the Astro version
   * hand-rolled a whole component state machine (session/draft/replyingTo/
   * busy/authReady/error/notice) manually re-rendered via
   * composer.innerHTML = `...` string templates, careful to special-case
   * the `input` event so typing didn't lose focus on every keystroke. All
   * of that collapses into $state + bind:value here — Svelte only
   * re-renders the parts that actually change, so there's no focus-loss
   * problem to work around in the first place.
   */
  import { onMount } from "svelte";
  import { LogOut, LogIn, Send, Reply, MessageCircle } from "@lucide/svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import type { LeafletComment } from "$lib/services/atproto/fetch";
  import { buildThread } from "$lib/utils/commentThread";
  import {
    initReaderSession,
    publishLeafletComment,
    signInReader,
    signOutReader,
    type ReaderSession,
  } from "$lib/services/atproto/commentClient";
  import { pulseAmbiance } from "$lib/stores/ambiance";

  interface Props {
    comments: LeafletComment[];
    subjectUri: string;
  }
  let { comments: base, subjectUri }: Props = $props();

  const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-gb", { year: "numeric", month: "short", day: "2-digit" });
  const msg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

  let local = $state<LeafletComment[]>([]);
  let session = $state<ReaderSession | null>(null);
  let identifier = $state("");
  let draft = $state("");
  let replyingTo = $state<LeafletComment | null>(null);
  let busy = $state(false);
  let authReady = $state(false);
  let error = $state("");
  let notice = $state("");
  let textareaEl: HTMLTextAreaElement | undefined = $state();

  const all = $derived([...base, ...local]);
  const thread = $derived(buildThread(all));
  const heading = $derived(all.length > 0 ? `${all.length} comment${all.length !== 1 ? "s" : ""}` : "Comments");

  onMount(async () => {
    try {
      session = await initReaderSession();
      if (session) identifier = session.handle;
    } catch (cause) {
      error = msg(cause, "Could not restore AT Protocol sign-in.");
    } finally {
      authReady = true;
    }
  });

  async function handleSignIn(e: SubmitEvent) {
    e.preventDefault();
    error = notice = "";
    busy = true;
    try {
      const returnTo = `${location.pathname}${location.search}${location.hash}`;
      await signInReader(identifier, returnTo);
    } catch (cause) {
      error = msg(cause, "Could not start AT Protocol sign-in.");
      busy = false;
    }
  }

  async function handleSignOut() {
    if (!session) return;
    error = notice = "";
    busy = true;
    try {
      await signOutReader(session);
      session = null;
      replyingTo = null;
      notice = "Signed out from commenting.";
    } catch (cause) {
      error = msg(cause, "Could not sign out.");
    } finally {
      busy = false;
    }
  }

  async function handleSubmit() {
    if (!session) return;
    error = notice = "";
    busy = true;
    const text = draft.trim();
    const parent = replyingTo?.uri;
    try {
      const created = await publishLeafletComment(session, subjectUri, text, parent);
      local.push({
        uri: created.uri,
        plaintext: text,
        createdAt: new Date().toISOString(),
        authorDid: session.did,
        authorHandle: session.handle,
        reply: parent ? { parent } : undefined,
      });
      draft = "";
      replyingTo = null;
      notice = "Comment published to your AT Protocol repository. It may take a moment to appear in other Leaflet readers.";
      pulseAmbiance();
    } catch (cause) {
      error = msg(cause, "Could not publish the comment.");
    } finally {
      busy = false;
    }
  }

  function startReply(c: LeafletComment) {
    replyingTo = c;
    error = notice = "";
    textareaEl?.focus();
  }
</script>

<section class="comments-section" aria-labelledby="comments-heading">
  <h2 class="section-heading" id="comments-heading">
    <MessageCircle size={16} />
    <span>{heading}</span>
  </h2>

  <div class="comment-composer">
    {#if session}
      <div class="comment-session-row">
        <span>Commenting as <strong>@{session.handle}</strong></span>
        <button type="button" class="comment-link-button" disabled={busy} onclick={handleSignOut}><LogOut size={14} /> Sign out</button>
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
        rows="4"
        placeholder={replyingTo ? `Reply to @${replyingTo.authorHandle}…` : "Share your thoughts…"}
        disabled={busy}
        bind:value={draft}
        bind:this={textareaEl}
      ></textarea>
      <div class="composer-actions">
        <span class="composer-note">Published as a <code>pub.leaflet.comment</code> record in your own repo.</span>
        <button type="button" class="comment-primary-button" disabled={busy || !draft.trim()} onclick={handleSubmit}>
          <Send size={14} />
          {busy ? "Publishing…" : "Publish comment"}
        </button>
      </div>
    {:else if !authReady}
      <p class="composer-note" role="status">Checking AT Protocol sign-in…</p>
    {:else}
      <form class="comment-signin" onsubmit={handleSignIn}>
        <div class="comment-signin-fields">
          <label
            ><span>AT Protocol handle</span>
            <input autocomplete="username" placeholder="you.example.com" bind:value={identifier} disabled={busy} required />
          </label>
        </div>
        <div class="composer-actions">
          <span class="composer-note"
            >Sign in with AT Protocol OAuth. This reader only requests permission to create <code>pub.leaflet.comment</code> records in
            your repo; your password is never shared with this site.</span
          >
          <button type="submit" class="comment-primary-button" disabled={busy || !identifier.trim()}>
            <LogIn size={14} />
            {busy ? "Opening sign-in…" : "Sign in to comment"}
          </button>
        </div>
      </form>
    {/if}
    {#if error}<p class="comment-status comment-status--error" role="alert">{error}</p>{/if}
    {#if notice}<p class="comment-status" role="status">{notice}</p>{/if}
  </div>

  <ul class="comment-list" hidden={thread.length === 0}>
    {#each thread as { comment: c, depth } (c.uri)}
      <li class="comment" style={`--comment-depth:${depth}`}>
        <div class="comment-head">
          <strong>{c.authorDisplayName ?? c.authorHandle}</strong>
          <a href={`https://bsky.app/profile/${encodeURIComponent(c.authorDid)}`} target="_blank" rel="noopener noreferrer" class="comment-handle"
            >@{c.authorHandle}</a
          >
          <time class="comment-date" datetime={c.createdAt}>{fmt(c.createdAt)}</time>
        </div>
        <p class="comment-body">{c.plaintext}</p>
        {#if session}
          <button type="button" class="comment-reply-button" onclick={() => startReply(c)}><Reply size={13} /> Reply</button>
        {/if}
      </li>
    {/each}
  </ul>
  {#if thread.length === 0}
    <EmptyState title="No comments yet" description="Be the first to share your thoughts on this post." icon={false} />
  {/if}
</section>

<style>
  .comment-list[hidden] {
    display: none;
  }
  .comment-composer {
    margin: 0 0 1.5rem;
    padding: 1rem;
    border: 1px solid var(--border-subtle, currentColor);
    border-radius: 0;
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
    border-radius: 0;
    background: var(--surface, transparent);
    color: inherit;
    font: inherit;
  }

  textarea {
    margin: 0.75rem 0;
    padding: 0.75rem;
    resize: vertical;
  }

  input {
    padding: 0.6rem 0.7rem;
  }

  .comment-signin-fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .comment-signin-fields label {
    display: grid;
    gap: 0.35rem;
    font-family: var(--font-mono);
    font-size: var(--text-micro);
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
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
    border-radius: 0;
    background: transparent;
    color: inherit;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .comment-primary-button:hover:not(:disabled) {
    background: var(--ink);
    color: var(--paper);
  }

  .comment-primary-button:disabled,
  .comment-link-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

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

  .composer-note {
    max-width: 42rem;
  }
  .comment-status {
    margin-top: 0.75rem;
  }
  .comment-status--error {
    opacity: 1;
  }

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
    .composer-actions {
      align-items: flex-start;
      flex-direction: column;
    }
    .comment-list .comment {
      margin-inline-start: min(calc(var(--comment-depth, 0) * 0.75rem), 3rem);
    }
  }
</style>
