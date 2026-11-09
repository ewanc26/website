<script lang="ts">
  /**
   * GraphVisualizer - Obsidian-like force-directed graph visualization
   * 
   * Displays repository events as nodes in a graph, with connections
   * between nodes that reference each other (e.g., posts, comments, etc.)
   * 
   * Uses a simple force-directed layout algorithm:
   * - Nodes repel each other
   * - Connected nodes attract each other (like springs)
   * - Nodes are dragged by user interaction
   */
  import { onMount, onDestroy, tick } from "svelte";
  import type { Snippet } from "svelte";

  interface Event {
    collection: string;
    uri: string;
    cid: string;
    createdAt: string;
    author: string;
    record: any;
    type?: 'teal' | 'standard';
    tealData?: any;
  }

  interface GraphNode {
    id: string;
    event: Event;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    label: string;
    fixed: boolean;
  }

  interface GraphEdge {
    source: string;
    target: string;
    strength?: number;
  }

  interface Props {
    events: Event[];
    width: number;
    height: number;
    onNodeClick?: (event: Event) => void;
  }

  let { events, width, height, onNodeClick = () => {} }: Props = $props();

  // Graph state
  let nodes: GraphNode[] = $state([]);
  let edges: GraphEdge[] = $state([]);
  let svgElement: SVGSVGElement | null = $state(null);
  let isDragging = $state(false);
  let draggedNode: GraphNode | null = $state(null);
  let dragStart: { x: number; y: number } | null = $state(null);
  let zoomLevel = $state(1);
  let panOffset = $state({ x: 0, y: 0 });

  // Physics parameters
  const REPEL_FORCE = 1000;
  const LINK_FORCE = 0.1;
  const LINK_DISTANCE = 150;
  const FRICTION = 0.9;
  const NODE_RADIUS = 20;
  const EDGE_STROKE = 2;

  // Color mapping for collections
  const collectionColors: Record<string, string> = {
    "app.bsky.feed.post": "#3b82f6",
    "app.bsky.feed.like": "#10b981",
    "app.bsky.feed.repost": "#8b5cf6",
    "app.bsky.graph.follow": "#f59e0b",
    "pub.leaflet.comment": "#ef4444",
    "site.standard.document": "#6366f1",
    "fm.teal.feed.play": "#ec4899",
  };

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

  // Get color for collection
  function getColor(collection: string): string {
    return collectionColors[collection] || "#9ca3af";
  }

  // Generate unique ID for node
  function getNodeId(event: Event): string {
    return event.uri || `${event.collection}-${event.cid}`;
  }

  // Detect references between events
  function detectReferences(events: Event[]): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const eventMap = new Map<string, Event>();

    // Build map of events by URI
    for (const event of events) {
      eventMap.set(event.uri, event);
    }

    // Check each event for references to other events
    for (const event of events) {
      const sourceId = getNodeId(event);
      const record = event.record;

      if (!record) continue;

      // Check for common reference patterns in AT Protocol records
      // Posts can reference other posts via reply, quote, embed, etc.
      if (record.reply) {
        const replyParentUri = record.reply.parent;
        if (replyParentUri && eventMap.has(replyParentUri)) {
          edges.push({
            source: sourceId,
            target: getNodeId(eventMap.get(replyParentUri)!),
            strength: 0.5,
          });
        }
      }

      // Check for embeds
      if (record.embeds) {
        for (const embed of record.embeds) {
          if (embed.uri && eventMap.has(embed.uri)) {
            edges.push({
              source: sourceId,
              target: getNodeId(eventMap.get(embed.uri)!),
              strength: 0.3,
            });
          }
        }
      }

      // Check for quotes
      if (record.quote) {
        const quoteUri = record.quote.uri;
        if (quoteUri && eventMap.has(quoteUri)) {
          edges.push({
            source: sourceId,
            target: getNodeId(eventMap.get(quoteUri)!),
            strength: 0.4,
          });
        }
      }

      // Comments reference their parent publication
      if (event.collection === "pub.leaflet.comment" && record.subject) {
        const subjectUri = record.subject;
        if (eventMap.has(subjectUri)) {
          edges.push({
            source: sourceId,
            target: getNodeId(eventMap.get(subjectUri)!),
            strength: 0.6,
          });
        }
      }

      // For demonstration, also connect events of the same type
      // This creates clusters of similar event types
      if (Math.random() < 0.1) {
        const sameTypeEvents = events.filter(
          (e) => e.collection === event.collection && e.uri !== event.uri
        );
        if (sameTypeEvents.length > 0) {
          const targetEvent = sameTypeEvents[Math.floor(Math.random() * sameTypeEvents.length)];
          edges.push({
            source: sourceId,
            target: getNodeId(targetEvent),
            strength: 0.2,
          });
        }
      }
    }

    return edges;
  }

  // Initialize or update graph
  function updateGraph() {
    // Create nodes from events
    const newNodes: GraphNode[] = events.map((event) => ({
      id: getNodeId(event),
      event,
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 100) + 50,
      vx: 0,
      vy: 0,
      radius: NODE_RADIUS,
      color: getColor(event.collection),
      label: getCollectionLabel(event.collection),
      fixed: false,
    }));

    // Detect references
    const newEdges = detectReferences(events);

    nodes = newNodes;
    edges = newEdges;
  }

  // Force-directed layout simulation
  function simulate() {
    if (nodes.length === 0) return;

    // Apply repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];

        // Skip if either node is being dragged
        if (n1.fixed || n2.fixed) continue;

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Avoid division by zero
        if (distance > 0) {
          const repelForce = REPEL_FORCE / (distance * distance);
          const fx = (dx / distance) * repelForce;
          const fy = (dy / distance) * repelForce;

          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }
    }

    // Apply attraction along edges
    for (const edge of edges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) continue;
      if (sourceNode.fixed && targetNode.fixed) continue;

      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const targetDistance = LINK_DISTANCE * (edge.strength || 1);

      if (distance > 0) {
        const linkForce = LINK_FORCE * (distance - targetDistance);
        const fx = (dx / distance) * linkForce;
        const fy = (dy / distance) * linkForce;

        if (!sourceNode.fixed) {
          sourceNode.vx += fx;
          sourceNode.vy += fy;
        }
        if (!targetNode.fixed) {
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      }
    }

    // Apply friction and update positions
    for (const node of nodes) {
      if (!node.fixed) {
        node.vx *= FRICTION;
        node.vy *= FRICTION;
        node.x += node.vx;
        node.y += node.vy;

        // Keep nodes within bounds
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
      }
    }
  }

  // Animation loop
  let animationFrame: number | null = null;

  function startAnimation() {
    if (animationFrame) cancelAnimationFrame(animationFrame);

    function animate() {
      simulate();
      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  // Handle mouse events for dragging
  function handleMouseDown(evt: MouseEvent, node: GraphNode) {
    isDragging = true;
    draggedNode = node;
    dragStart = { x: evt.clientX, y: evt.clientY };
    node.fixed = true;
    node.vx = 0;
    node.vy = 0;
  }

  function handleMouseMove(evt: MouseEvent) {
    if (!isDragging || !draggedNode || !dragStart) return;

    const dx = (evt.clientX - dragStart.x) / zoomLevel;
    const dy = (evt.clientY - dragStart.y) / zoomLevel;

    draggedNode.x = Math.max(draggedNode.radius, Math.min(width - draggedNode.radius, draggedNode.x + dx));
    draggedNode.y = Math.max(draggedNode.radius, Math.min(height - draggedNode.radius, draggedNode.y + dy));

    dragStart = { x: evt.clientX, y: evt.clientY };
    nodes = nodes; // Trigger reactivity
  }

  function handleMouseUp() {
    if (draggedNode) {
      draggedNode.fixed = false;
    }
    isDragging = false;
    draggedNode = null;
    dragStart = null;
  }

  // Handle zoom and pan
  function handleWheel(evt: WheelEvent) {
    evt.preventDefault();

    const delta = evt.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoomLevel * delta));
    const zoomRatio = newZoom / zoomLevel;

    // Zoom towards mouse position
    const mouseX = evt.clientX - svgElement!.getBoundingClientRect().left;
    const mouseY = evt.clientY - svgElement!.getBoundingClientRect().top;

    panOffset = {
      x: panOffset.x + mouseX * (1 - zoomRatio),
      y: panOffset.y + mouseY * (1 - zoomRatio),
    };

    zoomLevel = newZoom;
  }

  // Handle panning
  function handlePanStart(evt: MouseEvent) {
    if (evt.button !== 1) return; // Middle mouse button
    evt.preventDefault();
    isDragging = true;
    dragStart = { x: evt.clientX, y: evt.clientY };
  }

  function handlePanMove(evt: MouseEvent) {
    if (!isDragging || !dragStart || draggedNode) return;
    
    const dx = (evt.clientX - dragStart.x) / zoomLevel;
    const dy = (evt.clientY - dragStart.y) / zoomLevel;

    panOffset = {
      x: panOffset.x + dx,
      y: panOffset.y + dy,
    };

    dragStart = { x: evt.clientX, y: evt.clientY };
  }

  // Handle node click
  function handleNodeClick(evt: MouseEvent, node: GraphNode) {
    evt.stopPropagation();
    onNodeClick(node.event);
  }

  // Initialize
  $effect(() => {
    updateGraph();
    startAnimation();

    return () => {
      stopAnimation();
    };
  });

  // Update on props change
  $effect(() => {
    updateGraph();
  });

  // Cleanup
  onDestroy(() => {
    stopAnimation();
  });
</script>

<svg
  bind:this={svgElement}
  width="100%"
  height="100%"
  viewBox="0 0 {width} {height}"
  preserveAspectRatio="xMidYMid meet"
  class="graph-container"
  onwheel={handleWheel}
  onmousedown={handlePanStart}
  onmousemove={handlePanMove}
  onmouseup={handleMouseUp}
  onmouseleave={handleMouseUp}
>
  <!-- Defs for markers -->
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-text-500)" />
    </marker>
  </defs>

  <!-- Apply zoom and pan transform -->
  <g transform="translate({panOffset.x}, {panOffset.y}) scale({zoomLevel})">
    <!-- Edges (connections) -->
    {#each edges as edge (edge.source + edge.target)}
      <line
        x1={nodes.find(n => n.id === edge.source)?.x || 0}
        y1={nodes.find(n => n.id === edge.source)?.y || 0}
        x2={nodes.find(n => n.id === edge.target)?.x || 0}
        y2={nodes.find(n => n.id === edge.target)?.y || 0}
        stroke="var(--color-text-500)"
        stroke-width={EDGE_STROKE / zoomLevel}
        stroke-opacity="0.6"
        marker-end="url(#arrowhead)"
        class="graph-edge"
      />
    {/each}

    <!-- Nodes -->
    {#each nodes as node (node.id)}
      <g
        transform="translate({node.x}, {node.y})"
        class="graph-node"
        class:dragging={draggedNode?.id === node.id}
        onmousedown={(e) => handleMouseDown(e, node)}
        onmouseup={handleMouseUp}
        onclick={(e) => handleNodeClick(e, node)}
      >
        <!-- Node circle -->
        <circle
          r={node.radius / zoomLevel}
          fill={node.color}
          stroke="white"
          stroke-width="2"
          class="node-circle"
        />

        <!-- Node label -->
        <text
          x="0"
          y={node.radius / zoomLevel + 20 / zoomLevel}
          text-anchor="middle"
          fill="var(--color-text-800)"
          font-size={12 / zoomLevel}
          font-weight="500"
          class="node-label"
        >
          {node.label}
        </text>

        <!-- Tooltip-like info on hover -->
        <title>{node.event.collection} - {new Date(node.event.createdAt).toLocaleString()}</title>
      </g>
    {/each}
  </g>
</svg>

<style>
  .graph-container {
    width: 100%;
    height: 100%;
    background: var(--surface-color);
    border-radius: var(--radius-md);
    overflow: visible;
    cursor: grab;
  }

  .graph-container:active {
    cursor: grabbing;
  }

  .graph-edge {
    pointer-events: none;
    transition: stroke-opacity var(--duration-fast);
  }

  .graph-edge:hover {
    stroke-opacity: 1;
  }

  .graph-node {
    cursor: pointer;
    transition: transform var(--duration-fast);
  }

  .graph-node:hover .node-circle {
    stroke-width: 3;
    filter: drop-shadow(0 0 8px currentColor);
  }

  .graph-node.dragging .node-circle {
    stroke-width: 3;
    opacity: 0.8;
  }

  .node-circle {
    transition: all var(--duration-fast);
  }

  .node-label {
    pointer-events: none;
    user-select: none;
    transition: opacity var(--duration-fast);
  }

  @media (max-width: 640px) {
    .node-label {
      display: none;
    }
  }
</style>
