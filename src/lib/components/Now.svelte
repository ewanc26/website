<script lang="ts">
  import type { KibunStatusData } from '$lib/services/atproto/types';

  let { kibunStatus }: { kibunStatus: KibunStatusData | null } = $props();
</script>

{#if kibunStatus}
    <div class="now-card">
        <div class="now-header">
            <span class="now-label">Current Status</span>
        </div>
        <div class="now-body">
            <div class="now-emoji">{kibunStatus.emoji}</div>
            <p class="now-text">{kibunStatus.text}</p>
        </div>
        <div class="now-date">
            {new Date(kibunStatus.createdAt).toLocaleDateString()}
        </div>
    </div>
{/if}

<style>
  .now-card {
    margin: var(--space-lg) 0;
    padding: var(--space-md);
    border: 1px solid var(--color-accent-200);
    border-radius: var(--radius-lg);
    background-color: var(--color-canvas-100);
  }

  .now-header {
    margin-bottom: var(--space-sm);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .now-label {
    font-size: var(--text-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-primary-600);
  }

  .now-body {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .now-emoji {
    font-size: 2rem;
  }

  .now-text {
    margin: 0;
    font-size: var(--text-md);
    font-weight: 500;
    color: var(--color-ink-900);
  }

  .now-date {
    margin-top: var(--space-sm);
    font-size: var(--text-sm);
    opacity: 0.7;
    color: var(--color-ink-700);
  }
</style>
