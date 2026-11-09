<script lang="ts">
  /**
   * Live Repository Visualizer
   * 
   * An interactive, animated visualization of AT Protocol repository events.
   * Shows events from multiple collections in a dynamic, engaging interface.
   */
  import { onMount, afterUpdate } from "svelte";
  import { pulseAmbiance } from "$lib/stores/ambiance";
  import { PUBLIC_ATPROTO_DID } from "$env/static/public";

  interface Event {
    collection: string;
    uri: string;
    cid: string;
    createdAt: string;
    author: string;
    record: any;
  }

  let events = $state<Event[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let cursor = $state<string | null>(null);
  let hasMore = $state(true);
  let autoRefresh = $state(true);
  let lastFetch = $state<Date | null>(null);

  // Visualization state
  let containerWidth = $state(800);
  let containerHeight = $state(600);
  let animationFrame: number | null = null;
  let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; type: string; age: number }> = $state([]);

  // Collection colors
  const collectionColors: Record<string, string> = {
    "app.bsky.feed.post": "#3b82f6",
    "app.bsky.feed.like": "#10b981",
    "app.bsky.feed.repost": "#8b5cf6",
    "app.bsky.graph.follow": "#f59e0b",
    "pub.leaflet.comment": "#ef4444",
    "site.standard.document": "#6366f1",
  };

  // Collection icons/labels
  const collectionLabels: Record<string, string> = {
    "app.bsky.feed.post": "Post",
    "app.bsky.feed.like": "Like",
    "app.bsky.feed.repost": "Repost",
    "app.bsky.graph.follow": "Follow",
    "pub.leaflet.comment": "Comment",
    "site.standard.document": "Document",
  };

  // Fetch events from the API
  async function fetchEvents(append: boolean = false) {
    try {
      loading = !append;
      error = null;

      const params = new URLSearchParams({
        limit: "50",
      });
      if (cursor && append) params.set("cursor", cursor);

      const response = await fetch(`/api/repo/events?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      lastFetch = new Date();

      if (append) {
        events = [...events, ...data.events];
      } else {
        events = data.events;
      }

      cursor = data.cursor;
      hasMore = !!data.cursor;

      // Create particles from new events
      if (data.events.length > 0) {
        createParticlesFromEvents(data.events);
        pulseAmbiance();
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching events:", err);
    } finally {
      loading = false;
    }
  }

  // Create particles from events
  function createParticlesFromEvents(newEvents: Event[]) {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    for (const event of newEvents) {
      const collection = event.collection;
      const color = collectionColors[collection] || "#9ca3af";
      const label = collectionLabels[collection] || collection.split(".").pop() || "Event";

      // Spawn particles from the edges towards the center
      const spawnSide = Math.floor(Math.random() * 4);
      let x, y, vx, vy;

      switch (spawnSide) {
        case 0: // Top
          x = Math.random() * containerWidth;
          y = -20;
          vx = (Math.random() - 0.5) * 2;
          vy = 1 + Math.random() * 2;
          break;
        case 1: // Right
          x = containerWidth + 20;
          y = Math.random() * containerHeight;
          vx = -1 - Math.random() * 2;
          vy = (Math.random() - 0.5) * 2;
          break;
        case 2: // Bottom
          x = Math.random() * containerWidth;
          y = containerHeight + 20;
          vx = (Math.random() - 0.5) * 2;
          vy = -1 - Math.random() * 2;
          break;
        default: // Left
          x = -20;
          y = Math.random() * containerHeight;
          vx = 1 + Math.random() * 2;
          vy = (Math.random() - 0.5) * 2;
      }

      particles.push({
        x,
        y,
        vx,
        vy,
        size: 4 + Math.random() * 6,
        color,
        type: label,
        age: 0,
      });
    }
  }

  // Animation loop
  function animate() {
    const now = Date.now();

    // Update particles
    particles = particles.map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      age: p.age + 0.1,
    }));

    // Remove particles that are too old or out of bounds
    particles = particles.filter(
      (p) =>
        p.age < 200 &&
        p.x >= -50 &&
        p.x <= containerWidth + 50 &&
        p.y >= -50 &&
        p.y <= containerHeight + 50,
    );

    animationFrame = requestAnimationFrame(animate);
  }

  // Handle container resize
  function handleResize() {
    if (typeof window !== "undefined") {
      const container = document.getElementById("repo-visualizer");
      if (container) {
        containerWidth = container.clientWidth || 800;
        containerHeight = container.clientHeight || 600;
      }
    }
  }

  // Load more events
  async function loadMore() {
    if (loading || !hasMore) return;
    await fetchEvents(true);
  }

  // Toggle auto-refresh
  function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
    if (autoRefresh) {
      startAutoRefresh();
    }
  }

  // Auto-refresh interval
  let refreshInterval: number | null = null;

  function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = window.setInterval(() => {
      if (!loading) fetchEvents(false);
    }, 30000); // Refresh every 30 seconds
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  // Initialize
  onMount(() => {
    handleResize();
    fetchEvents(false);
    animate();
    startAutoRefresh();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      stopAutoRefresh();
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  });

  // Re-fetch when auto-refresh toggle changes
  $effect(() => {
    if (!autoRefresh) stopAutoRefresh();
    else startAutoRefresh();
  });
</script>

<svelte:head>
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.05); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
  </style>
</svelte:head>

<div class="repo-visualizer-container">
  <div class="visualizer-header">
    <h2>Live Repository Activity</h2>
    <div class="controls">
      <button type="button" onclick={() => fetchEvents(false)} disabled={loading} class:loading>
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      <button type="button" onclick={toggleAutoRefresh} class:active={autoRefresh}>
        Auto-refresh: {autoRefresh ? "On" : "Off"}
      </button>
    </div>
  </div>

  {#if error}
    <div class="error-message">
      <p>Error: {error}</p>
      <button type="button" onclick={() => fetchEvents(false)}>Retry</button>
    </div>
  {/if}

  <div id="repo-visualizer" class="visualizer-canvas" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
    <!-- Particle visualization -->
    <svg width="100%" height="100%" viewBox={`0 0 ${containerWidth} ${containerHeight}`}>
      {#each particles as p, i (i)}
        <circle
          cx={p.x}
          cy={p.y}
          r={p.size / 2}
          fill={p.color}
          opacity={Math.min(1, 1 - p.age / 200)}
          class="particle"
        />
      {/each}
    </svg>

    <!-- Event list overlay -->
    <div class="event-list">
      {#if events.length === 0 && !loading}
        <p class="empty-state">No events yet. Your repository is quiet.</p>
      {:else}
        {#each events.slice(0, 20) as event, i (event.uri)}
          {@const date = new Date(event.createdAt)}
          {@const label = collectionLabels[event.collection] || event.collection.split(".").pop() || "Event"}
          {@const color = collectionColors[event.collection] || "#9ca3af"}
          <div class="event-item" style={`--event-color: ${color}`}>
            <div class="event-icon" style={`background-color: ${color}`}>
              {label.slice(0, 1)}
            </div>
            <div class="event-content">
              <div class="event-type">{label}</div>
              <div class="event-time">{date.toLocaleTimeString()}</div>
            </div>
            <div class="event-meta">
              {event.collection}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  {#if hasMore}
    <div class="load-more">
      <button type="button" onclick={loadMore} disabled={loading}>
        {loading ? "Loading..." : "Load More"}
      </button>
    </div>
  {/if}

  <div class="stats">
    <span>Total events: {events.length}</span>
    {#if lastFetch}
      <span>Last updated: {lastFetch.toLocaleTimeString()}</span>
    {/if}
  </div>
</div>

<style>
  .repo-visualizer-container {
    font-family: var(--font-body, system-ui, sans-serif);
    max-width: 100%;
    margin: var(--space-lg) 0;
  }

  .visualizer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
    padding: var(--space-md);
    background: var(--surface-raised);
    border-radius: var(--radius-md);
    border: 1px solid var(--surface-color);
  }

  .visualizer-header h2 {
    margin: 0;
    font-size: var(--text-lg);
    color: var(--color-text-800);
  }

  .controls {
    display: flex;
    gap: var(--space-sm);
  }

  .controls button {
    padding: var(--space-xs) var(--space-sm);
    background: var(--surface-color);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-sm);
    color: var(--color-text-700);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: all var(--duration-fast) var(--ease-out-quart);
  }

  .controls button:hover:not(:disabled) {
    background: var(--surface-hover);
    color: var(--color-text-800);
  }

  .controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .controls button.active {
    background: var(--color-primary-500);
    color: white;
    border-color: var(--color-primary-500);
  }

  .visualizer-canvas {
    position: relative;
    width: 100%;
    height: 400px;
    background: var(--surface-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--surface-color);
  }

  .visualizer-canvas svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .particle {
    transition: opacity var(--duration-fast) var(--ease-out-quart);
    filter: drop-shadow(0 0 4px currentColor);
  }

  .event-list {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 50%;
    overflow-y: auto;
    padding: var(--space-md);
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    backdrop-filter: blur(10px);
  }

  .empty-state {
    text-align: center;
    color: var(--color-text-600);
    padding: var(--space-lg);
  }

  .event-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-xs) var(--space-sm);
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-xs);
    animation: fadeIn 0.3s ease-out;
    color: var(--color-text-800);
    font-size: var(--text-sm);
  }

  .event-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 12px;
    flex-shrink: 0;
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

  .event-time {
    font-size: 0.85em;
    color: var(--color-text-600);
  }

  .event-meta {
    font-size: 0.75em;
    color: var(--color-text-500);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  .load-more {
    text-align: center;
    margin-top: var(--space-md);
  }

  .load-more button {
    padding: var(--space-sm) var(--space-md);
    background: var(--surface-color);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
    color: var(--color-text-700);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: all var(--duration-fast) var(--ease-out-quart);
  }

  .load-more button:hover:not(:disabled) {
    background: var(--surface-hover);
    color: var(--color-text-800);
  }

  .load-more button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .stats {
    display: flex;
    justify-content: space-between;
    padding: var(--space-sm) var(--space-md);
    color: var(--color-text-600);
    font-size: var(--text-xs);
    margin-top: var(--space-sm);
  }

  .error-message {
    padding: var(--space-md);
    background: var(--surface-raised);
    border: 1px solid var(--color-error-500);
    border-radius: var(--radius-md);
    color: var(--color-error-700);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .error-message button {
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-error-500);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--text-sm);
  }
</style>
