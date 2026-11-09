<script lang="ts">
  interface Props {
    label: string;
    pressed: boolean;
    onClick: () => void;
    icon?: any;
    text?: string;
  }
  let { label, pressed, onClick, icon: Icon, text }: Props = $props();
</script>

<button
  class="footer-link active-press"
  aria-label={label}
  aria-pressed={pressed}
  type="button"
  onclick={onClick}
>
  {#if Icon}
    <Icon size={14} />
  {:else if text}
    {text}
  {/if}
</button>

<style>
  .footer-link {
    background: none;
    border: none;
    color: var(--color-text-600);
    text-decoration: none;
    white-space: nowrap;
    padding: var(--space-sm);
    font-size: var(--text-xs);
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out-quart);
  }
  .footer-link:hover {
    color: var(--color-primary-700);
  }
</style>
