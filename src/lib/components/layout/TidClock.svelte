<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let currentTID = '';
  let interval: NodeJS.Timeout;
  let isRunning = true;

  // Base32-sortable character set for TID encoding
  const BASE32_SORTABLE = '234567abcdefghijklmnopqrstuvwxyz';

  /**
   * Generate a random 10-bit clock identifier
   */
  function generateClockId(): number {
    return Math.floor(Math.random() * 1024); // 2^10 = 1024
  }

  /**
   * Convert a number to base32-sortable encoding
   */
  function toBase32Sortable(num: bigint): string {
    if (num === 0n) {
      return '2222222222222';
    }
    
    let result = '';
    while (num > 0n) {
      result = BASE32_SORTABLE[Number(num % 32n)] + result;
      num = num / 32n;
    }
    
    // Pad to 13 characters
    return result.padStart(13, '2');
  }

  /**
   * Generate a TID for the current timestamp
   */
  function generateTID(): string {
    // Get current timestamp in microseconds since UNIX epoch
    const nowMs = Date.now();
    const nowMicroseconds = BigInt(nowMs * 1000); // Convert to microseconds
    
    // Generate random clock identifier (10 bits)
    const clockId = generateClockId();
    
    // Combine timestamp (53 bits) and clock identifier (10 bits)
    // The top bit is always 0, so we have 63 bits total
    const tidBigInt = (nowMicroseconds << 10n) | BigInt(clockId);
    
    return toBase32Sortable(tidBigInt);
  }

  /**
   * Update the TID display
   */
  function updateTID() {
    if (isRunning) {
      currentTID = generateTID();
    }
  }

  /**
   * Copy TID to clipboard
   */
  async function copyTID() {
    try {
      await navigator.clipboard.writeText(currentTID);
      console.log('TID copied to clipboard:', currentTID);
    } catch (err) {
      console.error('Failed to copy TID:', err);
    }
  }

  onMount(() => {
    // Generate initial TID
    updateTID();
    
    // Update every 100ms for smooth display
    interval = setInterval(updateTID, 100);
  });

  onDestroy(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
</script>

<div class="tid-clock-container">
  <div class="tid-display">
    <span class="tid-label">TID:</span>
    <button 
      class="tid-value" 
      on:click={copyTID}
      title="Click to copy TID"
    >
      {currentTID}
    </button>
  </div>
</div>

<style>
  .tid-clock-container {
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    opacity: 0.7;
    margin-top: 0.5rem;
  }

  .tid-display {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    justify-content: center;
  }

  .tid-label {
    color: var(--text-color);
    font-weight: 500;
  }

  .tid-value {
    background: none;
    border: none;
    color: var(--link-color);
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
  }

  .tid-value:hover {
    color: var(--link-hover-color);
    background-color: var(--button-bg);
  }

  @media (max-width: 640px) {
    .tid-clock-container {
      display: none;
    }
  }
</style>