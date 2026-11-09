<script lang="ts">
  /**
   * Live Repository Visualizer
   * 
   * An interactive, animated visualization of AT Protocol repository events.
   * Uses Jetstream WebSocket for real-time updates.
   * Shows events from multiple collections in a dynamic, engaging interface.
   */
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { pulseAmbiance } from "$lib/stores/ambiance";
  import { ATPROTO_DID } from "$lib/config/atproto";
  import {
    FileText,
    Heart,
    Repeat,
    UserPlus,
    MessageCircle,
    File,
    Music,
    MessageSquare,
  } from "@lucide/svelte";

  const dispatch = createEventDispatcher();

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

  // Jetstream event types (based on pdsls implementation)
  // Events from Jetstream have: kind, did, commit (with collection, rkey, operation, etc.)
  interface JetstreamEvent {
    kind: 'commit' | 'identity' | 'account';
    did: string;
    time_us?: string;
    commit?: {
      collection: string;
      rkey: string;
      operation: 'create' | 'update' | 'delete';
      cid?: string;
      record?: any;
      uri?: string;
    };
    // For identity and account events
    operation?: string;
    collection?: string;
    rkey?: string;
    uri?: string;
    cid?: string;
    record?: any;
  }

  // Use the actual DID from config
  const DID = ATPROTO_DID;

  // Jetstream endpoints to try (fallback list)
  // Based on pdsls implementation: uses /subscribe endpoint with wantedCollections and wantedDids
  const JETSTREAM_ENDPOINTS = [
    'wss://jetstream.us-east.bsky.network/subscribe',
    'wss://jetstream1.us-east.bsky.network/subscribe',
    'wss://jetstream2.us-east.bsky.network/subscribe',
  ];

  // Allow events to be passed in as prop or fetched internally
  interface Props {
    initialEvents?: Event[];
  }
  let { initialEvents = [] }: Props = $props();

  let events = $state<Event[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Initialize events from prop if provided
  $effect(() => {
    if (initialEvents.length > 0) {
      events = initialEvents;
      loading = false;
    }
  });
  let cursor = $state<string | null>(null);
  let hasMore = $state(true);
  let lastFetch = $state<Date | null>(null);
  
  // WebSocket state
  let socket = $state<WebSocket | null>(null);
  let socketStatus = $state<'connecting' | 'open' | 'closed' | 'error'>('closed');
  let currentEndpointIndex = $state(0);
  let reconnectAttempts = $state(0);
  let maxReconnectAttempts = $state(5);
  let reconnectDelay = $state(3000);
  let lastConnectionError = $state<string | null>(null);

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
      socket = null;
    }

    // Try the next endpoint in the fallback list
    const baseUrl = JETSTREAM_ENDPOINTS[currentEndpointIndex];
    const collections = [
      'app.bsky.feed.post',
      'app.bsky.feed.like',
      'app.bsky.feed.repost',
      'app.bsky.graph.follow',
      'pub.leaflet.comment',
      'site.standard.document',
      'fm.teal.feed.play',
    ];
    
    // Build URL with pdsls-style parameters: wantedCollections and wantedDids
    // This matches the pdsls implementation at https://tangled.org/pds.ls/pdsls
    const collectionsParam = collections.map(c => `wantedCollections=${encodeURIComponent(c)}`).join('&');
    const jetstreamUrl = `${baseUrl}?${collectionsParam}&wantedDids=${encodeURIComponent(DID)}`;
    
    console.log(`Connecting to Jetstream endpoint ${currentEndpointIndex + 1}/${JETSTREAM_ENDPOINTS.length}:`, jetstreamUrl);
    socketStatus = 'connecting';
    lastConnectionError = null;
    
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
        
        // Try next endpoint or reconnect
        if (currentEndpointIndex < JETSTREAM_ENDPOINTS.length - 1) {
          // Try next endpoint immediately
          currentEndpointIndex++;
          reconnectAttempts = 0;
          console.log(`Trying next Jetstream endpoint...`);
          setTimeout(connectWebSocket, 1000);
        } else if (reconnectAttempts < maxReconnectAttempts) {
          // All endpoints tried, reconnect with exponential backoff
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts);
          reconnectAttempts++;
          currentEndpointIndex = 0; // Reset to first endpoint
          console.log(`All endpoints failed. Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
          setTimeout(connectWebSocket, delay);
        } else {
          error = 'All Jetstream endpoints failed. Please refresh the page.';
        }
      };

      socket.onerror = (err) => {
        console.error("Jetstream WebSocket error:", err);
        socketStatus = 'error';
        lastConnectionError = err instanceof Error ? err.message : 'Unknown error';
        error = `WebSocket error: ${lastConnectionError}. Retrying...`;
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      socketStatus = 'error';
      error = 'Failed to connect to Jetstream.';
      socket = null;
    }
  }

  // Handle incoming Jetstream event (based on pdsls format)
  function handleJetstreamEvent(jetstreamEvent: JetstreamEvent) {
    // Handle commit events (most common)
    if (jetstreamEvent.kind === 'commit') {
      const commit = jetstreamEvent.commit;
      if (!commit) return;
      
      // Check if this is for our DID
      if (jetstreamEvent.did !== DID) return;
      
      // Convert microseconds to ISO string
      const timestamp = jetstreamEvent.time_us 
        ? new Date(parseInt(jetstreamEvent.time_us) / 1000).toISOString()
        : new Date().toISOString();
      
      // Only handle create operations for now (can be expanded later)
      if (commit.operation !== 'create') return;
      
      // Create event from commit
      const newEvent: Event = {
        collection: commit.collection,
        uri: commit.uri || `at://${DID}/${commit.collection}/${commit.rkey}`,
        cid: commit.cid || '',
        createdAt: timestamp,
        author: jetstreamEvent.did,
        record: commit.record || null,
      };

      // Track discovered collection
      discoveredCollections.add(commit.collection);
      
      // Process event to extract teal data
      const processedEvent = extractTealData(newEvent);
      
      // Add to events at the beginning (most recent)
      events = [processedEvent, ...events.slice(0, 199)]; // Keep max 200 events
      
      // Create particles for the new event
      createParticlesFromEvents([processedEvent]);
      pulseAmbiance();
      lastFetch = new Date();
    }
    // Handle identity and account events (optional)
    else if (jetstreamEvent.kind === 'identity' || jetstreamEvent.kind === 'account') {
      // For now, skip these as they're not repository records
      console.log('Received identity/account event:', jetstreamEvent);
    }
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
    currentEndpointIndex = 0;
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
      <button type="button" onclick={reconnect} class:active={socketStatus === 'open'} class:error={socketStatus === 'error'} class="px-3 py-1.5 sm:px-4 sm:py-2" title={JETSTREAM_ENDPOINTS[currentEndpointIndex]}>
        WebSocket: {socketStatus === 'open' ? 'Live' : socketStatus === 'connecting' ? 'Connecting...' : socketStatus === 'closed' ? 'Disconnected' : 'Error'} ({currentEndpointIndex + 1}/{JETSTREAM_ENDPOINTS.length})
      </button>
    </div>
  </div>

  {#if error}
    <div class="error-message">
      <p>Error: {error}</p>
      {#if lastConnectionError}
        <p class="error-detail">Connection error: {lastConnectionError}</p>
        <p class="error-detail">Endpoint: {JETSTREAM_ENDPOINTS[currentEndpointIndex]}</p>
      {/if}
      <button type="button" onclick={() => { currentEndpointIndex = 0; reconnectAttempts = 0; fetchInitialEvents(); connectWebSocket(); }} class="px-3 py-1.5">Retry</button>
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
            <button type="button" class="event-item teal-event p-2 sm:p-3" style={`--event-color: ${color}`} onclick={() => dispatch('select', event)}>
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
            </button>
          {:else}
            {@const Icon = collectionIcons[event.collection] || FileText}
            <button type="button" class="event-item p-2 sm:p-3" style={`--event-color: ${color}`} onclick={() => dispatch('select', event)}>
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
            </button>
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
    flex-direction: column;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
    padding: var(--space-md);
    background: var(--surface-raised);
    border-radius: var(--radius-md);
    border: 1px solid var(--surface-color);
  }

  @media (min-width: 640px) {
    .visualizer-header {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .visualizer-header h2 {
    margin: 0;
    font-size: var(--text-lg);
    color: var(--color-text-800);
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    justify-content: center;
  }

  @media (min-width: 640px) {
    .controls {
      justify-content: flex-end;
    }
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
    padding: var(--space-sm) var(--space-md);
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    backdrop-filter: blur(10px);
  }

  @media (min-width: 640px) {
    .event-list {
      padding: var(--space-md);
      max-height: 50%;
    }
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
    border: none;
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-xs);
    animation: fadeIn 0.3s ease-out;
    color: var(--color-text-800);
    font-size: var(--text-sm);
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: all var(--duration-fast);
  }

  .event-item:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(4px);
  }

  .event-item:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  @media (min-width: 640px) {
    .event-item {
      padding: var(--space-sm) var(--space-md);
    }
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

  @media (min-width: 640px) {
    .event-icon {
      width: 28px;
      height: 28px;
    }
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
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    color: var(--color-text-600);
    font-size: var(--text-xs);
    margin-top: var(--space-sm);
    text-align: center;
  }

  @media (min-width: 640px) {
    .stats {
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
    }
  }

  .error-message {
    padding: var(--space-md);
    background: var(--surface-raised);
    border: 1px solid var(--color-error-500);
    border-radius: var(--radius-md);
    color: var(--color-error-700);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    align-items: flex-start;
  }

  .error-detail {
    font-size: var(--text-xs);
    color: var(--color-error-600);
    margin: 0;
    font-family: monospace;
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
