<script lang="ts">
  import { page } from '$app/state';
  import { ExternalLink, Link2 } from '@lucide/svelte';
  import BaseModal from '$lib/components/BaseModal.svelte';
  import { getPlaceholderAvatar } from '$lib/utils/avatar';

  interface BacklinkPerson {
    did: string;
    handle: string;
    displayName?: string;
    avatarUrl?: string;
    mentions: number;
  }

  interface BacklinkRecord {
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

  let { targets = [], limit = 8, class: className = '' }: Props = $props();
  let people = $state<BacklinkPerson[] | null>(null);
  let backlinks = $state<BacklinkRecord[]>([]);
  let mentionCount = $state(0);
  let modalOpen = $state(false);

  const resolvedTargets = $derived.by(() => {
    const data = page.data as {
      post?: { uri?: string; url?: string };
      blog?: { url?: string };
    };
    const values = [
      `https://ewancroft.uk${page.url.pathname}`,
      ...targets,
    ];

    if (data.post?.uri) values.push(data.post.uri);
    if (data.post?.url) values.push(data.post.url);
    if (page.url.pathname === '/blog' && data.blog?.url) values.push(data.blog.url);

    return [...new Set(values.filter(Boolean))];
  });

  const requestKey = $derived(resolvedTargets.join('\n'));
  const visiblePeople = $derived((people ?? []).slice(0, limit));
  const hiddenCount = $derived(Math.max(0, (people?.length ?? 0) - limit));

  $effect(() => {
    requestKey;
    const controller = new AbortController();
    const params = new URLSearchParams();
    for (const target of resolvedTargets) params.append('target', target);
    people = null;
    backlinks = [];
    mentionCount = 0;
    modalOpen = false;

    fetch(`/api/backlinks?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Backlinks API returned ${response.status}`);
        return response.json();
      })
      .then((result) => {
        people = result.people ?? [];
        backlinks = result.backlinks ?? [];
        mentionCount = result.mentions ?? 0;
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        people = [];
      });

    return () => controller.abort();
  });

  function useFallback(event: Event, did: string) {
    const image = event.currentTarget as HTMLImageElement;
    image.onerror = null;
    image.src = getPlaceholderAvatar(did);
  }
</script>

{#if people === null}
  <aside class={`backlink-avatars backlink-avatars--loading ${className}`} aria-label="Loading backlinks" aria-busy="true">
    <div class="avatar-stack avatar-stack--loading" aria-hidden="true">
      {#each Array(3) as _}
        <span class="avatar-skeleton"></span>
      {/each}
    </div>
    <span class="backlink-copy">Looking for backlinks…</span>
  </aside>
{:else if people.length > 0}
  <aside class={`backlink-avatars content-reveal ${className}`} aria-label="Backlinks">
    <button
      type="button"
      class="backlink-trigger"
      aria-haspopup="dialog"
      onclick={() => modalOpen = true}
    >
      <span class="backlink-label"><Link2 size={14} strokeWidth={2} aria-hidden="true" /> Mentioned by</span>
      <span class="avatar-stack" aria-hidden="true">
        {#each visiblePeople as person, index}
          <span
            class="backlink-avatar"
            style:z-index={visiblePeople.length - index}
          >
            <img
              src={person.avatarUrl || getPlaceholderAvatar(person.did)}
              alt=""
              width="34"
              height="34"
              loading="lazy"
              onerror={(event) => useFallback(event, person.did)}
            />
          </span>
        {/each}
        {#if hiddenCount > 0}
          <span class="backlink-overflow">+{hiddenCount}</span>
        {/if}
      </span>
      <span class="backlink-copy">
        {mentionCount} backlink{mentionCount === 1 ? '' : 's'} from {people.length} {people.length === 1 ? 'person' : 'people'}
      </span>
    </button>
  </aside>
{/if}

<BaseModal
  title={`Backlinks (${mentionCount})`}
  open={modalOpen}
  onClose={() => modalOpen = false}
>
  <p class="modal-intro">Posts and articles on the AT Protocol network that link to this page.</p>
  <ul class="backlink-records">
    {#each backlinks as backlink}
      <li class="backlink-record">
        <div class="record-author">
          <img
            src={backlink.authorAvatarUrl || getPlaceholderAvatar(backlink.authorDid)}
            alt=""
            width="36"
            height="36"
            loading="lazy"
            onerror={(event) => useFallback(event, backlink.authorDid)}
          />
          <div class="record-identity">
            <strong>{backlink.authorDisplayName ?? backlink.authorHandle}</strong>
            <span>@{backlink.authorHandle}</span>
          </div>
          {#if backlink.createdAt}
            <time datetime={backlink.createdAt}>
              {new Date(backlink.createdAt).toLocaleDateString('en-gb', { day: 'numeric', month: 'short', year: 'numeric' })}
            </time>
          {/if}
        </div>
        <p>{backlink.text}</p>
        <a href={backlink.url} target="_blank" rel="noopener noreferrer">
          {backlink.collection === 'app.bsky.feed.post' ? 'View Bluesky post' : 'View source'}
          <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
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
    border-radius: var(--radius-full);
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
    padding-left: 7px;
  }

  .backlink-avatar,
  .backlink-overflow,
  .avatar-skeleton {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    margin-left: -7px;
    overflow: hidden;
    border: 2px solid var(--color-canvas-50);
    border-radius: var(--radius-full);
    background: var(--surface-raised);
  }

  .backlink-avatar {
    transition:
      transform var(--duration-fast) var(--ease-out-quart),
      box-shadow var(--duration-fast) var(--ease-out-quart);
  }

  .backlink-trigger:hover .backlink-avatar {
    z-index: 20 !important;
    transform: translateY(-3px) scale(1.08);
    box-shadow: 0 4px 12px oklch(0% 0 0 / 0.18);
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
    animation: avatar-pulse 1.2s ease-in-out infinite alternate;
  }

  .avatar-skeleton:nth-child(2) { animation-delay: 120ms; }
  .avatar-skeleton:nth-child(3) { animation-delay: 240ms; }

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
    border-radius: var(--radius-full);
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
    from { background: var(--surface-color); }
    to { background: var(--surface-raised); }
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
    .avatar-skeleton { animation: none; }
    .backlink-avatar { transition: none; }
  }
</style>
