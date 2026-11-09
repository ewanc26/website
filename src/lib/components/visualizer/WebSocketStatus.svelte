<script lang="ts">
  /**
   * WebSocketStatus - Reusable component for displaying WebSocket connection status
   * 
   * Shows connection state with appropriate styling and error information
   */
  import type { Snippet } from "svelte";

  interface Props {
    status: 'connecting' | 'open' | 'closed' | 'error';
    endpointIndex: number;
    totalEndpoints: number;
    endpointUrl: string;
    error?: string | null;
    onReconnect: () => void;
  }

  let {
    status,
    endpointIndex,
    totalEndpoints,
    endpointUrl,
    error = null,
    onReconnect,
  }: Props = $props();

  const statusLabel = $derived(
    status === 'open' ? 'Live' :
    status === 'connecting' ? 'Connecting...' :
    status === 'closed' ? 'Disconnected' :
    'Error'
  );

  const statusClass = $derived(
    status === 'open' ? 'active' :
    status === 'error' ? 'error' :
    'default'
  );
</script>

<div class="websocket-status">
  <button
    type="button"
    onclick={onReconnect}
    class="status-button"
    class:active={status === 'open'}
    class:error={status === 'error'}
    title={endpointUrl}
  >
    WebSocket: {statusLabel} ({endpointIndex + 1}/{totalEndpoints})
  </button>
  
  {#if error}
    <div class="error-detail">
      {error}
    </div>
  {/if}
</div>

<style>
  .websocket-status {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .status-button {
    padding: var(--space-xs) var(--space-sm);
    background: var(--surface-color);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-sm);
    color: var(--color-text-700);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: all var(--duration-fast) var(--ease-out-quart);
    white-space: nowrap;
  }

  .status-button:hover {
    background: var(--surface-hover);
    color: var(--color-text-800);
  }

  .status-button.active {
    background: var(--color-primary-500);
    color: white;
    border-color: var(--color-primary-500);
  }

  .status-button.error {
    background: var(--color-error-500);
    color: white;
    border-color: var(--color-error-500);
  }

  .error-detail {
    font-size: var(--text-xs);
    color: var(--color-error-600);
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
</style>
