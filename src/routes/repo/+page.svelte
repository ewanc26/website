<script lang="ts">
  import RepoVisualizer from "$lib/components/RepoVisualizer.svelte";
  import { GraphVisualizer, RecordViewer } from "$lib/components/visualizer";
  import SeoHead from "$lib/components/SeoHead.svelte";
  import Slab from "$lib/components/Slab.svelte";

  let { data } = $props();

  // State for events and selected event
  let events = $state<any[]>([]);
  let loading = $state(true);
  let selectedEvent = $state<any>(null);
  let showGraphView = $state(true);

  // Fetch events on mount
  async function fetchEvents() {
    try {
      loading = true;
      const response = await fetch('/api/repo/events?limit=100');
      if (response.ok) {
        const data = await response.json();
        events = data.events || [];
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      loading = false;
    }
  }

  // Handle event selection
  function handleEventSelect(event: any) {
    selectedEvent = event;
  }

  // Toggle between graph and particle view
  function toggleView() {
    showGraphView = !showGraphView;
  }

  // Fetch events when component mounts
  $effect(() => {
    fetchEvents();
  });
</script>

<SeoHead
  title="Repository Visualizer"
  description="Live visualization of AT Protocol repository events and activity"
  ogSubtitle="Live repository activity"
  ogType="TOOL"
  siteInfo={data.siteInfo}
/>

<main class="repo-page">
  <Slab word="Repository" />
  
  <!-- Full-width header -->
  <div class="repo-header">
    <div class="wrap">
      <div class="header-content">
        <h1>Live Repository Activity</h1>
        <p class="lede">
          Watch your AT Protocol repository come to life with this interactive visualizer.
          See posts, likes, reposts, comments, music plays, and more as they happen.
        </p>
        
        <!-- View toggle -->
        <div class="view-toggle">
          <button 
            type="button" 
            onclick={toggleView}
            class:active={showGraphView}
            disabled={loading}
          >
            Graph View
          </button>
          <button 
            type="button" 
            onclick={toggleView}
            class:active={!showGraphView}
            disabled={loading}
          >
            Particle View
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Full-width visualizer section -->
  <div class="visualizer-section">
    <div class="wrap">
      {#if loading}
        <div class="loading-message">
          <p>Loading repository events...</p>
        </div>
      {:else if events.length === 0}
        <div class="empty-message">
          <p>No events found in your repository.</p>
        </div>
      {:else}
        {#if showGraphView}
          <!-- Graph View - Obsidian-like -->
          <div class="graph-container-wrapper">
            <GraphVisualizer 
              events={events}
              width={1200}
              height={600}
              onNodeClick={handleEventSelect}
            />
          </div>
        {:else}
          <!-- Particle View -->
          <RepoVisualizer 
            initialEvents={events}
            on:select={handleEventSelect}
          />
        {/if}
      {/if}
    </div>
  </div>

  <!-- Record Viewer Modal -->
  <RecordViewer event={selectedEvent} onClose={() => selectedEvent = null} />

  <!-- Info section -->
  <div class="info-section">
    <div class="wrap">
      <div class="cols">
        <div>
          <h2>How it works</h2>
        </div>
        <div>
          <p>
            {#if showGraphView}
              This <strong>Graph View</strong> (similar to Obsidian's graph) shows your repository events 
              as nodes that connect to each other when they reference one another. Posts that reply to 
              other posts, comments on publications, and other relationships are visualized as connections.
              You can drag nodes, zoom with your mouse wheel, and click on any node to view its details.
            {:else}
              This <strong>Particle View</strong> shows your repository events as animated particles. 
              Each event appears as a colored particle that animates across the canvas.
            {/if}
          </p>
          
          <p>
            The visualization updates automatically via Jetstream WebSocket, or you can manually 
            refresh to see the latest activity. Click on any event to view its full details in 
            the record viewer.
          </p>
          
          <p>
            Use the toggle above to switch between Graph View (Obsidian-like connections) and 
            Particle View (animated particles).
          </p>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  .repo-page {
    position: relative;
  }

  .repo-header {
    padding: var(--space-lg) 0;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .repo-header h1 {
    margin: 0 0 var(--space-md);
    font-size: var(--text-2xl);
    font-weight: 900;
    line-height: 1.1;
  }

  .repo-header .lede {
    margin: 0;
    font-size: var(--text-lg);
    color: var(--color-text-700);
    max-width: 60ch;
  }

  .view-toggle {
    display: flex;
    gap: var(--space-sm);
    align-self: flex-start;
  }

  .view-toggle button {
    padding: var(--space-sm) var(--space-md);
    background: var(--surface-color);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
    color: var(--color-text-700);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: all var(--duration-fast);
  }

  .view-toggle button:hover:not(:disabled) {
    background: var(--surface-hover);
    color: var(--color-text-800);
  }

  .view-toggle button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .view-toggle button.active {
    background: var(--color-primary-500);
    color: white;
    border-color: var(--color-primary-500);
  }

  .visualizer-section {
    padding: var(--space-lg) 0;
    background: var(--surface-raised);
    border-top: 1px solid var(--surface-color);
    border-bottom: 1px solid var(--surface-color);
  }

  .visualizer-section .wrap {
    max-width: 100%;
    padding: 0;
  }

  .graph-container-wrapper {
    width: 100%;
    height: 600px;
    min-height: 400px;
    background: var(--surface-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--surface-color);
  }

  @media (max-width: 768px) {
    .graph-container-wrapper {
      height: 400px;
    }
  }

  .loading-message,
  .empty-message {
    padding: var(--space-xl);
    text-align: center;
    color: var(--color-text-600);
  }

  .info-section {
    padding: var(--space-xl) 0;
  }
</style>
