<script lang="ts">
  import { CircleAlert } from "@lucide/svelte";

  interface Props {
    title: string;
    description: string;
    icon?: boolean;
  }
  let { title, description, icon = true }: Props = $props();
</script>

<div class="empty-state">
  {#if icon}
    <div class="empty-state-icon"><CircleAlert size={32} /></div>
  {/if}
  <p class="empty-state-title">{title}</p>
  <p class="empty-state-text">{description}</p>
</div>

<style>
  .empty-state {
    padding: var(--space-lg);
    border: 2px dashed var(--ink);
    background: var(--paper);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .empty-state-icon {
    color: var(--ink-soft);
  }

  .empty-state-title {
    margin: 0;
    font-size: var(--text-md);
    font-family: var(--font-pixel);
    font-weight: 600;
    color: var(--ink);
  }

  .empty-state-text {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--ink-soft);
    line-height: 1.6;
    max-width: 55ch;
  }
</style>
