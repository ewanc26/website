<script lang="ts">
  /**
   * EventDisplay - Reusable component for displaying AT Protocol repository events
   * 
   * Shows event information with appropriate icons, colors, and formatting
   * Supports special handling for teal.fm music plays
   */
  import type { Snippet } from "svelte";
  import {
    FileText,
    Heart,
    Repeat,
    UserPlus,
    MessageCircle,
    File,
    Music,
    type LucideIcon,
  } from "@lucide/svelte";

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
    event: Event;
    color: string;
    compact?: boolean;
  }

  let { event, color, compact = false }: Props = $props();

  // Map collections to Lucide icons
  const collectionIcons: Record<string, LucideIcon> = {
    "app.bsky.feed.post": MessageCircle,
    "app.bsky.feed.like": Heart,
    "app.bsky.feed.repost": Repeat,
    "app.bsky.graph.follow": UserPlus,
    "pub.leaflet.comment": MessageCircle,
    "site.standard.document": File,
    "fm.teal.feed.play": Music,
  };

  // Generate a human-readable label from a collection name
  function getCollectionLabel(collection: string): string {
    const predefinedLabels: Record<string, string> = {
      "app.bsky.feed.post": "Post",
      "app.bsky.feed.like": "Like",
      "app.bsky.feed.repost": "Repost",
      "app.bsky.graph.follow": "Follow",
      "pub.leaflet.comment": "Comment",
      "site.standard.document": "Document",
    };
    
    if (predefinedLabels[collection]) {
      return predefinedLabels[collection];
    }
    
    const parts = collection.split(".");
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }
    return collection;
  }

  const date = $derived(new Date(event.createdAt));
  const label = $derived(getCollectionLabel(event.collection));
  const Icon = $derived(collectionIcons[event.collection] || FileText);
  const isTeal = $derived(event.type === "teal" && event.tealData !== undefined);
</script>

<div class="event-display" class:compact class:teal={isTeal}>
  <div class="event-icon" style={`background-color: ${color}`}>
    <Icon size={compact ? 14 : 16} />
  </div>
  
  <div class="event-content">
    {#if isTeal && event.tealData}
      <div class="event-type">
        Now Playing: {event.tealData.track}
      </div>
      <div class="event-artist">
        {event.tealData.artists.join(', ')}
      </div>
    {:else}
      <div class="event-type">{label}</div>
    {/if}
    
    <div class="event-time">{date.toLocaleTimeString()}</div>
  </div>
  
  <div class="event-meta">
    {event.collection}
  </div>
</div>

<style>
  .event-display {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-xs);
    animation: fadeIn 0.3s ease-out;
    color: var(--color-text-800);
    font-size: var(--text-sm);
  }

  .event-display.compact {
    padding: var(--space-xs);
    font-size: var(--text-xs);
  }

  .event-display.teal {
    border-left: 3px solid #ec4899;
  }

  .event-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 12px;
    flex-shrink: 0;
  }

  .event-display.compact .event-icon {
    width: 20px;
    height: 20px;
  }

  .event-content {
    flex: 1;
    min-width: 0;
  }

  .event-type {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .event-artist {
    font-size: var(--text-xs);
    color: var(--color-text-600);
    margin-top: 2px;
  }

  .event-time {
    font-size: var(--text-xs);
    color: var(--color-text-600);
  }

  .event-meta {
    font-size: var(--text-xs);
    color: var(--color-text-500);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  .event-display.compact .event-meta {
    display: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
