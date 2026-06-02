<script lang="ts">
  import { AlertCircle } from '@lucide/svelte';

  interface Props {
    title: string;
    description: string;
    icon?: boolean;
  }

  let { title, description, icon = true }: Props = $props();
</script>

<div class="empty-state">
  {#if icon}
    <div class="empty-state-icon">
      <AlertCircle size={32} />
    </div>
  {/if}
  <p class="empty-state-title">{title}</p>
  <p class="empty-state-text">{description}</p>
</div>

<style>
  .empty-state {
    padding: var(--space-lg);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .empty-state-icon {
    color: var(--color-ink-500);
  }

  .empty-state-title {
    margin: 0;
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--color-ink-700);
  }

  .empty-state-text {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    line-height: 1.6;
    max-width: 55ch;
  }
</style>
