<script lang="ts">
  import BaseModal from './BaseModal.svelte';
  let { sabbat, onClose } = $props();

  const sabbatDate = $derived.by(() => {
    if (!sabbat) return null;
    const now = new Date();
    const thisYear = now.getFullYear();
    const candidate = new Date(thisYear, sabbat.month - 1, sabbat.day);
    const date = candidate < now ? new Date(thisYear + 1, sabbat.month - 1, sabbat.day) : candidate;
    return date.toLocaleDateString('en-gb', { day: 'numeric', month: 'long', year: 'numeric' });
  });
</script>

<BaseModal 
  title={sabbat?.name ?? ""}
  open={!!sabbat}
  onClose={onClose}
>
  {#if sabbat}
    {#if sabbatDate}
      <p class="modal-date">{sabbatDate}</p>
    {/if}
    <div class="modal-body">
      {#each sabbat.description.split('\n\n') as paragraph}
        <p>{paragraph}</p>
      {/each}
    </div>

    {#snippet footer()}
      <a href="https://en.wikipedia.org/wiki/Wheel_of_the_Year#Festivals" target="_blank" rel="noopener noreferrer">Learn more about the Wheel of the Year</a>
    {/snippet}
  {/if}
</BaseModal>

<style>
  .modal-date {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-600);
    margin: 0 0 var(--space-md);
  }

  .modal-body p {
    margin-bottom: var(--space-md);
    color: var(--color-text-800);
  }
</style>
