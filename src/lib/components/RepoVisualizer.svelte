<script lang="ts">
  /**
   * Live Repository Visualizer
   * 
   * An interactive, animated visualization of AT Protocol repository events.
   * Uses Jetstream WebSocket for real-time updates.
   * Shows events from multiple collections in a dynamic, engaging interface.
   */
  import { onMount, onDestroy } from "svelte";
  import { pulseAmbiance } from "$lib/stores/ambiance";
  import {
    FileText,
    Heart,
    Repeat,
    UserPlus,
    MessageCircle,
    File,
    Music,
    MessageSquare,
    PlayCircle,
  } from "@lucide/svelte";

  interface Event {
    collection: string;
    uri: string;
    cid: string;
    createdAt: string;
    author: string;
    record: any;
    // Special type for teal records
    type?: 'teal' | 'standard';
    tealData?: TealPlayData;
  }

  // Teal record data structure for fm.teal.feed.play
  interface TealPlayData {
    track: string;
    artists: string[];
    release?: string;
    playedAt: string;
    durationSec?: number;
    service?: string;
  }

  // Jetstream event types (v2 format)
  interface JetstreamEvent {
    $type: string;
    payload: {
      $type: string;
      did: string;
      seq: number;
      time: string;
      operation: 'create' | 'update' | 'delete';
      collection: string;
      rkey: string;
      uri?: string;
      cid?: string;
      record?: any;
    };
  }

  // Use the actual DID from config
  const DID = "did:plc:ofrbh253gwicbkc5nktqepol";

  let events = $state<Event[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let cursor = $state<string | null>(null);
  let hasMore = $state(true);
  let lastFetch = $state<Date | null>(null);
  
  // WebSocket state
  let socket = $state<WebSocket | null>(null);
  let socketStatus = $state<'connecting' | 'open' | 'closed' | 'error'>('closed');
  let reconnectAttempts = $state(0);
  let maxReconnectAttempts = $state(5);
  let reconnectDelay = $state(3000);

  // Visualization state
  let containerWidth = $state(800);
  let containerHeight = $state(600);
  let animationFrame: number | null = null;
  let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; type: string; age: number; isTeal?: boolean }> = $state([]);

  // Track all discovered collections dynamically
  let discoveredCollections = $state<Set<string>>(new Set());

  // Predefined colors for known collections (fallback to dynamic generation)
  const knownCollectionColors: Record<string, string> = {
    "app.bsky.feed.post": "#3b82f6",
    "app.bsky.feed.like": "#10b981",
    "app.bsky.feed.repost": "#8b5cf6",
    "app.bsky.graph.follow": "#f59e0b",
    "pub.leaflet.comment": "#ef4444",
    "site.standard.document": "#6366f1",
  };

  // Predefined labels for known collections (fallback to dynamic generation)
  const knownCollectionLabels: Record<string, string> = {
    "app.bsky.feed.post": "Post",
    "app.bsky.feed.like": "Like",
    "app.bsky.feed.repost": "Repost",
    "app.bsky.graph.follow": "Follow",
    "pub.leaflet.comment": "Comment",
    "site.standard.document": "Document",
  };

  // Map collections to Lucide icons
  const collectionIcons: Record<string, any> = {
    "app.bsky.feed.post": MessageSquare,
    "app.bsky.feed.like": Heart,
    "app.bsky.feed.repost": Repeat,
    "app.bsky.graph.follow": UserPlus,
    "pub.leaflet.comment": MessageCircle,
    "site.standard.document": File,
    "fm.teal.feed.play": Music,
  };

  // Generate a consistent color for any collection using its name
  function getCollectionColor(collection: string): string {
    // Use predefined color if available
    if (knownCollectionColors[collection]) {
      return knownCollectionColors[collection];
    }
    
    // Generate a deterministic color based on collection name
    let hash = 0;
    for (let i = 0; i < collection.length; i++) {
      hash = collection.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use the hash to pick from a palette of distinct colors
    const colors = [
      "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
      "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
      "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
      "#ec4899", "#f43f5e", "#991b1b", "#78716c", "#57534e",
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  // Generate a human-readable label from a collection name
  function getCollectionLabel(collection: string): string {
    // Use predefined label if available
    if (knownCollectionLabels[collection]) {
      return knownCollectionLabels[collection];
    }
    
    // Extract the last part of the collection name
    const parts = collection.split(".");
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      // Capitalize first letter
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }
    return collection;
  }

  // Update discovered collections when new events arrive
  function updateDiscoveredCollections(newEvents: Event[]) {
    for (const event of newEvents) {
      discoveredCollections.add(event.collection);
    }
  }

  // Extract Teal play data from record if it's a teal record
  function extractTealData(event: Event): Event {
    // Check if this is a teal.fm play record
    if (event.collection === "fm.teal.feed.play" && event.record) {
      const record = event.record as {
        trackName?: string;
        artists?: { artistName?: string }[];
        releaseName?: string;
        playedTime?: string;
        duration?: number;
        musicServiceUri?: string;
      };
      
      const tealData: TealPlayData = {
        track: record.trackName?.trim() || "",
        artists: (record.artists ?? [])
          .map((a) => a.artistName?.trim() || "")
          .filter(Boolean),
        release: record.releaseName?.trim(),
        playedAt: record.playedTime || event.createdAt,
        durationSec: typeof record.duration === "number" ? record.duration : undefined,
        service: record.musicServiceUri,
      };
      
      // Only add tealData if we have a track
      if (tealData.track) {
        return {
          ...event,
          type: "teal",
          tealData,
        };
      }
    }
    
    return {
      ...event,
      type: "standard",
    };
  }

  // Fetch initial events from the API (for historical data)
  async function fetchInitialEvents() {
    try {
      loading = true;
      error = null;

      const params = new URLSearchParams({
        limit: "50",
      });

      const response = await fetch(`/api/repo/events?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      lastFetch = new Date();

      // Process events to extract teal data
      events = data.events.map(extractTealData);
      cursor = data.cursor;
      hasMore = !!data.cursor;

      // Track discovered collections and create particles
      if (data.events.length > 0) {
        updateDiscoveredCollections(data.events);
        createParticlesFromEvents(events);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching initial events:", err);
    } finally {
      loading = false;
    }
  }

  // Load more historical events
  async function fetchMoreEvents() {
    if (loading || !hasMore) return;
    
    try {
      loading = true;
      error = null;

      const params = new URLSearchParams({
        limit: "50",
      });
      if (cursor) params.set("cursor", cursor);

      const response = await fetch(`/api/repo/events?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      lastFetch = new Date();

      // Process events to extract teal data
      const processedEvents = data.events.map(extractTealData);
      events = [...events, ...processedEvents];
      cursor = data.cursor;
      hasMore = !!data.cursor;

      // Track discovered collections and create particles
      if (data.events.length > 0) {
        updateDiscoveredCollections(data.events);
        createParticlesFromEvents(processedEvents);
        pulseAmbiance();
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
      console.error("Error fetching more events:", err);
    } finally {
      loading = false;
    }
  }

  // Connect to Jetstream WebSocket
  function connectWebSocket() {
    // Close existing connection if any
    if (socket) {
      socket.close();
    }

        const jetstreamUrl = `wss://jetstream.us-east.bsky.network/xrpc/network.bsky.jetstream.subscribeEvents?dids=${encodeURIComponent(DID)}&collections=app.bsky.feed.post&collections=app.bsky.feed.like&collections=app.bsky.feed.repost&collections=app.bsky.graph.follow&collections=pub.leaflet.comment&collections=site.standard.document&collections=fm.teal.feed.play&kinds=commit`;
    
    console.log("Connecting to Jetstream:", jetstreamUrl);
    socketStatus = 'connecting';
    
    try {
      socket = new WebSocket(jetstreamUrl, ['xrpc.v1.json']);

      socket.onopen = () => {
        console.log("Jetstream WebSocket connected");
        socketStatus = 'open';
        reconnectAttempts = 0;
        error = null;
      };

      socket.onmessage = (event) => {
        try {
          const jetstreamEvent: JetstreamEvent = JSON.parse(event.data);
          handleJetstreamEvent(jetstreamEvent);
        } catch (err) {
          console.error("Error parsing Jetstream event:", err);
        }
      };

      socket.onclose = () => {
        console.log("Jetstream WebSocket closed");
        socketStatus = 'closed';
        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts);
          reconnectAttempts++;
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
          setTimeout(connectWebSocket, delay);
        } else {
          error = 'WebSocket disconnected. Please refresh the page.';
        }
      };

      socket.onerror = (err) => {
        console.error("Jetstream WebSocket error:", err);
        socketStatus = 'error';
        error = 'WebSocket connection error. Retrying...';
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      socketStatus = 'error';
      error = 'Failed to connect to Jetstream.';
      socket = null;
    }
  }

  // Handle incoming Jetstream event (v2 format)
  function handleJetstreamEvent(jetstreamEvent: JetstreamEvent) {
    // v2 format: events are wrapped in a message envelope with payload
    const payload = jetstreamEvent.payload;
    
    // Only handle commit events
    if (payload.$type !== 'network.bsky.jetstream.subscribeEvents#commit') return;
    
    const timestamp = new Date(payload.time).toISOString();
    
    // Only handle create operations
    if (payload.operation !== 'create') return;
    
    // Check if this is for our DID
    if (payload.did !== DID) return;

    // Create event from payload
    const newEvent: Event = {
      collection: payload.collection,
      uri: payload.uri || '',
      cid: payload.cid || '',
      createdAt: timestamp,
      author: payload.did,
      record: payload.record || null,
    };

    // Track discovered collection
    discoveredCollections.add(payload.collection);
    
    // Process event to extract teal data
    const processedEvent = extractTealData(newEvent);
    
    // Add to events at the beginning (most recent)
    events = [processedEvent, ...events.slice(0, 199)]; // Keep max 200 events
    
    // Create particles for the new event
    createParticlesFromEvents([processedEvent]);
    pulseAmbiance();
    lastFetch = new Date();
  }

  // Create particles from events
  function createParticlesFromEvents(newEvents: Event[]) {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    for (const event of newEvents) {
      const collection = event.collection;
      const color = getCollectionColor(collection);
      const label = getCollectionLabel(collection);
      const isTeal = event.type === "teal";
      
      // Track discovered collections
      discoveredCollections.add(collection);

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

      // Special handling for teal records (music plays)
      if (isTeal) {
        // Create multiple particles for teal records to represent music notes
        for (let i = 0; i < 3; i++) {
          particles.push({
            x,
            y,
            vx: vx + (Math.random() - 0.5) * 0.5,
            vy: vy + (Math.random() - 0.5) * 0.5,
            size: 5 + Math.random() * 7,
            color: "#ec4899", // Special pink/purple color for teal records
            type: "music",
            age: 0,
            isTeal: true,
          });
        }
      } else {
        particles.push({
          x,
          y,
          vx,
          vy,
          size: 4 + Math.random() * 6,
          color,
          type: label,
          age: 0,
          isTeal: false,
        });
      }
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

  // Load more historical events
  async function loadMore() {
    await fetchMoreEvents();
  }

  // Reconnect WebSocket
  function reconnect() {
    if (socket) {
      socket.close();
    }
    reconnectAttempts = 0;
    connectWebSocket();
  }

  // Initialize
  onMount(() => {
    handleResize();
    fetchInitialEvents();
    animate();
    connectWebSocket();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (socket) {
        socket.close();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  });

  // Reconnect when DID changes or on error
  $effect(() => {
    if (socketStatus === 'error' || socketStatus === 'closed') {
      const timer = setTimeout(() => {
        if (socketStatus !== 'open' && socketStatus !== 'connecting') {
          connectWebSocket();
        }
      }, reconnectDelay);
      
      return () => clearTimeout(timer);
    }
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
  
  .teal-event {
    border-left: 3px solid #ec4899;
  }

  .teal-event .event-icon {
    font-size: 1.2em;
  }

  .event-artist {
    font-size: var(--text-xs);
    color: var(--color-text-600);
    margin-top: 2px;
  }

</style>
</svelte:head>

<div class="repo-visualizer-container">
  <div class="visualizer-header flex-col sm:flex-row gap-2 sm:gap-0">
    <h2 class="text-base sm:text-lg">Live Repository Activity</h2>
    <div class="controls flex-wrap gap-1">
      <button type="button" onclick={() => fetchInitialEvents()} disabled={loading} class:loading class="px-3 py-1.5 sm:px-4 sm:py-2">
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      <button type="button" onclick={reconnect} class:active={socketStatus === 'open'} class:error={socketStatus === 'error'} class="px-3 py-1.5 sm:px-4 sm:py-2">
        WebSocket: {socketStatus === 'open' ? 'Live' : socketStatus === 'connecting' ? 'Connecting...' : socketStatus === 'closed' ? 'Disconnected' : 'Error'}
      </button>
    </div>
  </div>

  {#if error}
    <div class="error-message">
      <p>Error: {error}</p>
      <button type="button" onclick={() => fetchInitialEvents()} class="px-3 py-1.5">Retry</button>
    </div>
  {/if}

  <div id="repo-visualizer" class="visualizer-canvas md:h-[400px] h-[300px]" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
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
    <div class="event-list max-h-[40%] sm:max-h-[50%]">
      {#if events.length === 0 && !loading}
        <p class="empty-state">No events yet. Your repository is quiet.</p>
      {:else}
        {#each events.slice(0, 20) as event, i (event.uri)}
          {@const date = new Date(event.createdAt)}
          {@const label = getCollectionLabel(event.collection)}
          {@const color = getCollectionColor(event.collection)}
          
          {#if event.type === 'teal' && event.tealData}
            <div class="event-item teal-event p-2 sm:p-3" style={`--event-color: ${color}`}>
              <div class="event-icon" style={`background-color: ${color}`}>
                <Music size={16} />
              </div>
              <div class="event-content">
                <div class="event-type">
                  Now Playing: {event.tealData.track}
                </div>
                <div class="event-artist">
                  {event.tealData.artists.join(', ')}
                </div>
                <div class="event-time">{date.toLocaleTimeString()}</div>
              </div>
              <div class="event-meta">
                {event.collection}
              </div>
            </div>
          {:else}
            {@const Icon = collectionIcons[event.collection] || FileText}
            <div class="event-item p-2 sm:p-3" style={`--event-color: ${color}`}>
              <div class="event-icon" style={`background-color: ${color}`}>
                <Icon size={16} />
              </div>
              <div class="event-content">
                <div class="event-type">{label}</div>
                <div class="event-time">{date.toLocaleTimeString()}</div>
              </div>
              <div class="event-meta">
                {event.collection}
              </div>
            </div>
          {/if}
        {/each}
      {/if}
    </div>
  </div>

  {#if hasMore}
    <div class="load-more">
      <button type="button" onclick={loadMore} disabled={loading} class="px-4 py-2">
        {loading ? "Loading..." : "Load More"}
      </button>
    </div>
  {/if}

  {#if discoveredCollections.size > 0}
    <div class="lexicon-visualizer">
      <h3>Discovered Lexicons ({discoveredCollections.size})</h3>
      <div class="lexicon-grid">
        {#each Array.from(discoveredCollections) as collection}
          {@const color = getCollectionColor(collection)}
          {@const label = getCollectionLabel(collection)}
          <div class="lexicon-item" style={`--lexicon-color: ${color}`}>
            <div class="lexicon-color" style={`background-color: ${color}`}></div>
            <div class="lexicon-info">
              <div class="lexicon-label">{label}</div>
              <div class="lexicon-name">{collection}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="stats flex-col sm:flex-row gap-1 sm:gap-0 text-center sm:text-left">
    <span>Total events: {events.length}</span>
    {#if lastFetch}
      <span>Last updated: {lastFetch.toLocaleTimeString()}</span>
    {/if}
    <span>Connection: {socketStatus}</span>
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

  .controls button.error {
    background: var(--color-error-500);
    color: white;
    border-color: var(--color-error-500);
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

  .lexicon-visualizer {
    margin-top: var(--space-md);
    padding: var(--space-md);
    background: var(--surface-raised);
    border-radius: var(--radius-md);
    border: 1px solid var(--surface-color);
  }

  .lexicon-visualizer h3 {
    margin: 0 0 var(--space-md);
    font-size: var(--text-md);
    color: var(--color-text-800);
  }

  .lexicon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-sm);
  }

  @media (min-width: 640px) {
    .lexicon-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }

  .lexicon-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    background: var(--surface-color);
    border-radius: var(--radius-sm);
    transition: all var(--duration-fast) var(--ease-out-quart);
  }

  .lexicon-item:hover {
    background: var(--surface-hover);
    transform: translateX(4px);
  }

  .lexicon-color {
    width: 12px;
    height: 12px;
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
    font-size: var(--text-sm);
  }

  .lexicon-name {
    font-size: var(--text-xs);
    color: var(--color-text-500);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
