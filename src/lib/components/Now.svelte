<script lang="ts">
  import type { KibunStatusData } from '$lib/services/atproto/types';

  let { kibunStatus }: { kibunStatus: KibunStatusData | null } = $props();
</script>

{#if kibunStatus}
    <div style="margin: var(--space-lg) 0; padding: var(--space-md); border: 1px solid var(--color-accent-200); border-radius: var(--radius-lg); background-color: var(--color-canvas-100);">
        <div style="margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm);">
            <span style="font-size: var(--text-sm); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-600);">
                Current Status
            </span>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-md);">
            <div style="font-size: 2rem;">{kibunStatus.emoji}</div>
            <p style="margin: 0; font-size: var(--text-md); font-weight: 500; color: var(--color-ink-900);">
                {kibunStatus.text}
            </p>
        </div>
        <div style="margin-top: var(--space-sm); font-size: var(--text-sm); opacity: 0.7; color: var(--color-ink-700);">
            {new Date(kibunStatus.createdAt).toLocaleDateString()}
        </div>
    </div>
{/if}
