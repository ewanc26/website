<script lang="ts">
  /**
   * LexiconBadge - Reusable component for displaying AT Protocol lexicon/collection information
   * 
   * Shows collection name with a colored badge and label
   */
  import type { Snippet } from "svelte";

  interface Props {
    collection: string;
    color: string;
    showFullName?: boolean;
  }

  let { collection, color, showFullName = false }: Props = $props();

  // Predefined labels for known collections
  const knownCollectionLabels: Record<string, string> = {
    "app.bsky.feed.post": "Post",
    "app.bsky.feed.like": "Like",
    "app.bsky.feed.repost": "Repost",
    "app.bsky.graph.follow": "Follow",
    "pub.leaflet.comment": "Comment",
    "site.standard.document": "Document",
  };

  // Generate a human-readable label from a collection name
  function getCollectionLabel(collection: string): string {
    if (knownCollectionLabels[collection]) {
      return knownCollectionLabels[collection];
    }
    
    const parts = collection.split(".");
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }
    return collection;
  }

  const label = $derived(getCollectionLabel(collection));
</script>

<div class="lexicon-badge" style={`--lexicon-color: ${color}`}>
  <div class="lexicon-color" style={`background-color: ${color}`}></div>
  <div class="lexicon-info">
    <div class="lexicon-label">{label}</div>
    {#if showFullName}
      <div class="lexicon-name">{collection}</div>
    {/if}
  </div>
</div>

<style>
  .lexicon-badge {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: var(--surface-color);
    border-radius: var(--radius-sm);
    transition: all var(--duration-fast) var(--ease-out-quart);
    font-size: var(--text-sm);
  }

  .lexicon-badge:hover {
    background: var(--surface-hover);
    transform: translateX(2px);
  }

  .lexicon-color {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .lexicon-info {
    flex: 1;
    min-width: 0;
  }

  .lexicon-label {
    font-weight: 500;
    color: var(--color-text-800);
  }

  .lexicon-name {
    font-size: var(--text-xs);
    color: var(--color-text-500);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
