<script lang="ts">
  import { Link2, ExternalLink } from "@lucide/svelte";
  import BaseModal from "$lib/components/BaseModal.svelte";
  import { getPlaceholderAvatar } from "$lib/utils/avatar";

  interface Person {
    did: string;
    handle: string;
    displayName?: string;
    avatarUrl?: string;
    mentions: number;
  }
  interface RecordItem {
    uri: string;
    collection: string;
    text: string;
    createdAt?: string;
    authorDid: string;
    authorHandle: string;
    authorDisplayName?: string;
    authorAvatarUrl?: string;
    url: string;
  }

  interface Props {
    targets?: string[];
    limit?: number;
    class?: string;
  }
  let { targets = [], limit = 8, class: className = "" }: Props = $props();

  let people = $state<Person[]>([]);
  let records = $state<RecordItem[]>([]);
  let mentions = $state(0);
  let status = $state<"loading" | "loaded" | "empty" | "error">("loading");

  $effect(() => {
    const unique = [...new Set(targets.filter(Boolean))];
    status = "loading";
    people = [];
    records = [];
    mentions = 0;

    if (unique.length === 0) {
      status = "empty";
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    for (const t of unique) params.append("target", t);

    fetch(`/api/backlinks?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((result: { people?: Person[]; backlinks?: RecordItem[]; mentions?: number }) => {
        people = result.people ?? [];
        records = result.backlinks ?? [];
        mentions = result.mentions ?? 0;
        status = people.length ? "loaded" : "empty";
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        status = "error";
      });

    return () => controller.abort();
  });

  const visible = $derived(people.slice(0, limit));
  const overflow = $derived(Math.max(0, people.length - limit));

  function avatarSrc(src: string | undefined, did: string) {
    return src || getPlaceholderAvatar(did);
  }
  function handleAvatarError(e: Event, did: string) {
    const img = e.currentTarget as HTMLImageElement;
    img.onerror = null;
    img.src = getPlaceholderAvatar(did);
  }
</script>

{#if status === "loading"}
  <aside class={`backlink-avatars backlink-avatars--loading ${className}`} aria-label="Loading backlinks" aria-busy="true">
    <div class="avatar-stack avatar-stack--loading" aria-hidden="true">
      {#each Array.from({ length: 3 }) as _, i (i)}<span class="avatar-skeleton"></span>{/each}
    </div>
    <span class="backlink-copy">Looking for backlinks…</span>
  </aside>
{:else if status === "loaded"}
  <aside class={`backlink-avatars content-reveal ${className}`} aria-label="Backlinks">
    <button type="button" class="backlink-trigger" aria-haspopup="dialog" data-modal-open="backlinks-modal">
      <span class="backlink-label"><Link2 size={14} /> Mentioned by</span>
      <span class="avatar-stack" aria-hidden="true">
        {#each visible as p, i (p.did)}
          <span class="backlink-avatar" style={`z-index:${visible.length - i}`}>
            <img src={avatarSrc(p.avatarUrl, p.did)} alt="" width="34" height="34" loading="lazy" onerror={(e) => handleAvatarError(e, p.did)} />
          </span>
        {/each}
        {#if overflow > 0}<span class="backlink-overflow">+{overflow}</span>{/if}
      </span>
      <span class="backlink-copy">{mentions} backlink{mentions === 1 ? "" : "s"} from {people.length} {people.length === 1 ? "person" : "people"}</span>
    </button>
  </aside>
{/if}

<BaseModal id="backlinks-modal" title={`Backlinks (${mentions})`}>
  <p class="modal-intro">Posts and articles on the AT Protocol network that link to this page.</p>
  <ul class="backlink-records">
    {#each records as r (r.uri)}
      <li class="backlink-record">
        <div class="record-author">
          <img src={avatarSrc(r.authorAvatarUrl, r.authorDid)} alt="" width="36" height="36" loading="lazy" onerror={(e) => handleAvatarError(e, r.authorDid)} />
          <div class="record-identity">
            <strong>{r.authorDisplayName ?? r.authorHandle}</strong>
            <span>@{r.authorHandle}</span>
          </div>
          {#if r.createdAt}
            <time datetime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString("en-gb", { day: "2-digit", month: "short", year: "numeric" })}</time>
          {/if}
        </div>
        <p>{r.text}</p>
        <a href={r.url} target="_blank" rel="noopener noreferrer">
          {r.collection === "app.bsky.feed.post" ? "View Bluesky post" : "View source"} <ExternalLink size={14} />
        </a>
      </li>
    {/each}
  </ul>
</BaseModal>

<style>
  .backlink-avatars {
    width: min(calc(100% - 2 * var(--space-lg)), 72rem);
    min-height: 42px;
    margin: var(--space-lg) auto var(--space-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--space-sm);
    color: var(--color-text-600);
    font-size: var(--text-xs);
  }

  .backlink-avatars--loading {
    opacity: 0.65;
  }

  .backlink-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--space-sm);
    min-height: 44px;
    padding: var(--space-xs) var(--space-sm);
    border: 0;
    border-radius: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .backlink-trigger:hover,
  .backlink-trigger:focus-visible {
    background: var(--surface-sunken);
    color: var(--color-text-800);
  }

  .backlink-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .avatar-stack {
    display: flex;
    align-items: center;
    padding-left: var(--space-sm);
  }

  .backlink-avatar,
  .backlink-overflow,
  .avatar-skeleton {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    margin-left: calc(-1 * var(--space-sm));
    overflow: hidden;
    border: 2px solid var(--color-canvas-50);
    border-radius: 0;
    background: var(--surface-raised);
  }

  .backlink-avatar {
    transition: opacity var(--duration-fast) var(--ease-out-quart);
    display: block;
  }

  .backlink-trigger:hover .backlink-avatar {
    z-index: 20 !important;
    opacity: 0.72;
  }

  .backlink-avatar img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .backlink-overflow {
    position: relative;
    z-index: 0;
    display: grid;
    place-items: center;
    color: var(--color-text-700);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
  }

  .avatar-skeleton {
    animation: avatar-pulse 1.2s var(--ease-out-quart) infinite alternate;
  }

  .avatar-skeleton:nth-child(2) {
    animation-delay: 100ms;
  }
  .avatar-skeleton:nth-child(3) {
    animation-delay: 200ms;
  }

  .modal-intro {
    margin: 0 0 var(--space-md);
    color: var(--color-text-600);
    font-size: var(--text-sm);
  }

  .backlink-records {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .backlink-record {
    padding: var(--space-md);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
    background: var(--surface-sunken);
  }

  .record-author {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .record-author img {
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    border-radius: 0;
    object-fit: cover;
  }

  .record-identity {
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.25;
  }

  .record-identity strong {
    overflow: hidden;
    font-size: var(--text-sm);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .record-identity span,
  .record-author time {
    color: var(--color-text-600);
    font-size: var(--text-xs);
  }

  .record-author time {
    margin-left: auto;
    white-space: nowrap;
  }

  .backlink-record > p {
    display: -webkit-box;
    overflow: hidden;
    margin: var(--space-sm) 0;
    font-size: var(--text-sm);
    line-height: 1.55;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
    line-clamp: 5;
  }

  .backlink-record > a {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    color: var(--color-primary-600);
    font-size: var(--text-xs);
    font-weight: 650;
    text-decoration: none;
  }

  .backlink-record > a:hover {
    text-decoration: underline;
  }

  @keyframes avatar-pulse {
    from {
      background: var(--surface-color);
    }
    to {
      background: var(--surface-raised);
    }
  }

  @media (max-width: 640px) {
    .backlink-avatars {
      width: calc(100% - 2 * var(--space-md));
      margin-top: var(--space-md);
    }

    .backlink-copy {
      width: 100%;
      text-align: center;
    }

    .backlink-trigger {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .avatar-skeleton {
      animation: none;
    }
    .backlink-avatar {
      transition: none;
    }
  }
</style>
