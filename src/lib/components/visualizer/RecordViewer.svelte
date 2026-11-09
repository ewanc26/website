<script lang="ts">
  /**
   * RecordViewer - Detailed viewer for AT Protocol repository records
   * 
   * Displays full record details in a clean, readable format
   * Supports all collection types with appropriate formatting
   */
  import type { Snippet } from "svelte";
  import { FileText, Calendar, User, Tag, Clock, type LucideIcon } from "@lucide/svelte";

  interface TealPlayData {
    track: string;
    artists: string[];
    release?: string;
    playedAt: string;
    durationSec?: number;
    service?: string;
  }

  interface Event {
    collection: string;
    uri: string;
    cid: string;
    createdAt: string;
    author: string;
    record: any;
    type?: 'teal' | 'standard';
    tealData?: TealPlayData;
  }

  interface Props {
    event: Event | null;
    onClose: () => void;
  }

  let { event, onClose }: Props = $props();

  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  // Format CID (shorten it)
  function formatCID(cid: string): string {
    if (!cid) return "N/A";
    return cid.slice(0, 16) + "..." + cid.slice(-4);
  }

  // Get collection icon
  function getCollectionIcon(collection: string): LucideIcon {
    const icons: Record<string, LucideIcon> = {
      "app.bsky.feed.post": FileText,
      "app.bsky.feed.like": FileText,
      "app.bsky.feed.repost": FileText,
      "app.bsky.graph.follow": User,
      "pub.leaflet.comment": FileText,
      "site.standard.document": FileText,
      "fm.teal.feed.play": FileText,
    };
    return icons[collection] || FileText;
  }

  // Get collection label
  function getCollectionLabel(collection: string): string {
    const labels: Record<string, string> = {
      "app.bsky.feed.post": "Post",
      "app.bsky.feed.like": "Like",
      "app.bsky.feed.repost": "Repost",
      "app.bsky.graph.follow": "Follow",
      "pub.leaflet.comment": "Comment",
      "site.standard.document": "Document",
    };
    return labels[collection] || collection.split(".").pop() || collection;
  }

  const Icon = $derived(event ? getCollectionIcon(event.collection) : FileText);
  const label = $derived(event ? getCollectionLabel(event.collection) : "");
  const date = $derived(event ? new Date(event.createdAt) : null);

  function stopPropagation(evt: MouseEvent) {
    evt.stopPropagation();
  }
</script>

{#if event}
  <!-- eslint-disable-next-line svelte-a11y-click-events-have-key-events, svelte-a11y-no-static-element-interactions -->
  <div class="record-viewer-overlay" onclick={onClose} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && onClose()}>
    <!-- eslint-disable-next-line svelte-a11y-click-events-have-key-events, svelte-a11y-no-static-element-interactions -->
    <div class="record-viewer" onclick={stopPropagation} role="dialog" aria-modal="true" aria-labelledby="record-title">
      <div class="record-header">
        <div class="record-title">
          <Icon size={24} />
          <div>
            <h3>{label}</h3>
            <span class="record-collection">{event.collection}</span>
          </div>
        </div>
        <button class="close-button" onclick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="record-body">
        <!-- Metadata Section -->
        <section class="record-section">
          <h4><Calendar size={16} /> Metadata</h4>
          <dl class="record-meta">
            <div>
              <dt>Created</dt>
              <dd>{formatDate(event.createdAt)}</dd>
            </div>
            <div>
              <dt>URI</dt>
              <dd><code>{event.uri}</code></dd>
            </div>
            <div>
              <dt>CID</dt>
              <dd><code>{formatCID(event.cid)}</code></dd>
            </div>
            <div>
              <dt>Author</dt>
              <dd><code>{event.author}</code></dd>
            </div>
          </dl>
        </section>

        <!-- Teal Record Section -->
        {#if event.type === 'teal' && event.tealData}
          <section class="record-section teal-section">
            <h4><Tag size={16} /> Music Play</h4>
            <div class="teal-content">
              <div class="teal-track">{event.tealData.track}</div>
              <div class="teal-artists">
                {#each event.tealData.artists as artist, i}
                  <span class="teal-artist">{artist}{i < event.tealData.artists.length - 1 ? ', ' : ''}</span>
                {/each}
              </div>
              {#if event.tealData.release}
                <div class="teal-release">Album: {event.tealData.release}</div>
              {/if}
              {#if event.tealData.durationSec}
                <div class="teal-duration">Duration: {Math.floor(event.tealData.durationSec / 60)}:{String(event.tealData.durationSec % 60).padStart(2, '0')}</div>
              {/if}
              {#if event.tealData.service}
                <div class="teal-service">Service: {event.tealData.service}</div>
              {/if}
              <div class="teal-played">Played: {formatDate(event.tealData.playedAt)}</div>
            </div>
          </section>
        {:else if event.record}
          <!-- Generic Record Section -->
          <section class="record-section">
            <h4><FileText size={16} /> Record Data</h4>
            <pre class="record-data">{JSON.stringify(event.record, null, 2)}</pre>
          </section>
        {/if}
      </div>

      <div class="record-footer">
        <button class="secondary-button" onclick={onClose}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .record-viewer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-md);
  }

  .record-viewer {
    background: var(--paper);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .record-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md);
    border-bottom: 1px solid var(--surface-color);
    background: var(--surface-raised);
  }

  .record-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .record-title h3 {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 700;
  }

  .record-collection {
    font-size: var(--text-sm);
    color: var(--color-text-600);
    font-family: monospace;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-600);
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    transition: all var(--duration-fast);
  }

  .close-button:hover {
    background: var(--surface-color);
    color: var(--color-text-800);
  }

  .record-body {
    padding: var(--space-md);
  }

  .record-section {
    margin-bottom: var(--space-lg);
  }

  .record-section h4 {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    margin: 0 0 var(--space-md);
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--color-text-800);
  }

  .record-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-sm);
  }

  .record-meta dt {
    font-size: var(--text-xs);
    color: var(--color-text-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .record-meta dd {
    margin: var(--space-xs) 0 0;
    font-size: var(--text-sm);
    color: var(--color-text-800);
  }

  .record-meta code {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    background: var(--surface-color);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    display: inline-block;
    word-break: break-all;
  }

  .teal-section {
    border-left: 4px solid #ec4899;
    padding-left: var(--space-md);
  }

  .teal-content {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.05) 100%);
    padding: var(--space-md);
    border-radius: var(--radius-md);
  }

  .teal-track {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text-900);
    margin-bottom: var(--space-xs);
  }

  .teal-artists {
    font-size: var(--text-md);
    color: var(--color-text-700);
    margin-bottom: var(--space-sm);
  }

  .teal-artist {
    font-weight: 500;
  }

  .teal-release,
  .teal-duration,
  .teal-service,
  .teal-played {
    font-size: var(--text-sm);
    color: var(--color-text-600);
    margin-bottom: var(--space-xs);
  }

  .record-data {
    background: var(--surface-color);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .record-footer {
    padding: var(--space-md);
    border-top: 1px solid var(--surface-color);
    background: var(--surface-raised);
    display: flex;
    justify-content: flex-end;
  }

  .secondary-button {
    padding: var(--space-sm) var(--space-md);
    background: var(--surface-color);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
    color: var(--color-text-700);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: all var(--duration-fast);
  }

  .secondary-button:hover {
    background: var(--surface-hover);
    color: var(--color-text-800);
  }
</style>
