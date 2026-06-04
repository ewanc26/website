<script lang="ts">
  let { sabbat, onClose } = $props();
</script>

<dialog open={!!sabbat} onclose={onClose} class="sabbat-modal">
  {#if sabbat}
    <div class="modal-content">
      <header class="modal-header">
        <h2 class="modal-title">{sabbat.name}</h2>
        <button onclick={onClose} class="close-btn" aria-label="Close">×</button>
      </header>
      <div class="modal-body">
        {#each sabbat.description.split('\n\n') as paragraph}
          <p>{paragraph}</p>
        {/each}
        <p class="modal-footer">
          <a href="https://en.wikipedia.org/wiki/Wheel_of_the_Year#Festivals" target="_blank" rel="noopener noreferrer">Learn more about the Wheel of the Year</a>
        </p>
      </div>
    </div>
  {/if}
</dialog>

<style>
  .sabbat-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(90vw, 500px);
    background: var(--color-background-50);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    z-index: 2000;
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
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-700);
  }

  .modal-body p {
    line-height: 1.6;
    margin-bottom: var(--space-md);
    color: var(--color-text-800);
  }

  .modal-footer {
    font-size: var(--text-xs);
    margin-top: var(--space-md);
  }
</style>
