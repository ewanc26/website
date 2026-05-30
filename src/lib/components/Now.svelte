<script lang="ts">
  import { NOW } from '$lib/config';
</script>

<div style="margin: var(--space-lg) 0; padding: var(--space-md); border: 1px solid var(--color-accent-200); border-radius: 4px;">
    <p style="margin: 0; font-size: var(--text-sm); opacity: 0.8;">
        <strong>Now:</strong> {NOW.status}
    </p>
</div>
