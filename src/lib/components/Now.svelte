<script lang="ts">
  import { NOW } from '$lib/config';
</script>

<div style="margin: var(--space-lg) 0; padding: var(--space-md); border: 1px solid var(--color-accent-200); border-radius: 8px; background-color: var(--color-canvas-100);">
    <div style="margin-bottom: var(--space-sm); display: flex; align-items: center; gap: var(--space-sm);">
        <span style="font-size: var(--text-sm); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-600);">
            Current Status
        </span>
    </div>
    <p style="margin: 0; font-size: var(--text-md); font-weight: 500; color: var(--color-ink-900);">
        {NOW.status}
    </p>
    <div style="margin-top: var(--space-sm); font-size: var(--text-sm); opacity: 0.7; color: var(--color-ink-700);">
        Updated: {NOW.updatedAt}
    </div>
</div>
