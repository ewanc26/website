<script lang="ts">
  import { X } from '@lucide/svelte';
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';

  let { 
    title, 
    open, 
    onClose, 
    children,
    footer
  }: { 
    title: string, 
    open: boolean, 
    onClose: () => void, 
    children: Snippet,
    footer?: Snippet
  } = $props();

  let portalElement = $state<HTMLElement | null>(null);
  onMount(() => {
    portalElement = document.body;
  });
</script>

{#if open && portalElement}
  <!-- svelte-ignore -->
  <div use:portal={portalElement} class="portal-wrapper">
    <div class="backdrop" role="presentation" onclick={onClose}></div>
    <dialog {open} class="base-modal">
      <div class="modal-content">
        <header class="modal-header">
          <h2 class="modal-title">{title}</h2>
          <button onclick={onClose} class="close-btn" aria-label="Close">
            <X size={20} />
          </button>
        </header>
        <div class="modal-body">
          {@render children()}
        </div>
        {#if footer}
          <footer class="modal-footer">
            {@render footer()}
          </footer>
        {/if}
      </div>
    </dialog>
  </div>
{/if}

<script module>
  function portal(node: HTMLElement, target: HTMLElement) {
    target.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    };
  }
</script>

<style>
  .portal-wrapper {
    position: absolute;
    top: 0;
    left: 0;
  }
  .backdrop {
    position: fixed;
    inset: 0;
    background-color: color-mix(in oklch, var(--color-text-950) 20%, transparent);
    z-index: 9998;
  }

  .base-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(90vw, 420px);
    background: var(--color-background-50);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    z-index: 9999;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
  }

  .modal-title {
    font-size: var(--text-lg);
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-700);
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-right: -10px;
  }

  .close-btn:hover {
    color: var(--color-primary-500);
  }

  .modal-body {
    color: var(--color-text-800);
    line-height: 1.6;
  }

  .modal-footer {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end;
    margin-top: var(--space-lg);
    padding-top: var(--space-md);
    border-top: 1px solid var(--surface-color);
  }
</style>
