<script lang="ts">
  export let verified = false;
  export let label = "Verified";
</script>

{#if verified}
  <div class="verification-badge">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span class="label">{label}</span>
  </div>
{/if}

<style>
  .verification-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    background-color: var(--color-blue-100, #dbeafe);
    color: var(--color-blue-700, #1d4ed8);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .icon {
    width: 1rem;
    height: 1rem;
  }
</style>