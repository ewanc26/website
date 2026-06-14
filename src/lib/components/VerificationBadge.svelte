<script lang="ts">
  /**
   * VerificationBadge.svelte
   * Refactored to use the site's global CSS variables for colors, spacing, and motion.
   * This ensures the badge stays cohesive with the brand even as seasonal colors change.
   */
  let { verified = false } = $props();
</script>

{#if verified}
  <span class="verification-seal" title="Verified Account" aria-label="Verified Identity">
    <svg 
      viewBox="0 0 12 12" 
      width="12" 
      height="12" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Geometric Diamond aligned to the clinical aesthetic -->
      <path d="M6 1L11 6L6 11L1 6L6 1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      <circle cx="6" cy="6" r="1.2" fill="currentColor" />
    </svg>
  </span>
{/if}

<style>
  .verification-seal {
    /* Anchored to the 4pt grid tokens */
    margin-left: var(--space-xs, 0.25rem);
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    
    /* 
       Using semantic brand variables. 
       --brand-color is the site's primary seasonal accent (e.g. from sabbats).
    */
    color: var(--brand-color, var(--color-text-700, #555)); 
    
    /* Subtle glow leveraging color-mix and brand variables */
    filter: drop-shadow(0 0 2px color-mix(in oklch, var(--brand-color, currentColor) 30%, transparent));
    
    /* Leveraging site's standardized motion tokens */
    transition: 
      color var(--duration-fast, 150ms) var(--ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
      filter var(--duration-fast, 150ms) var(--ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
      transform var(--duration-normal, 250ms) var(--ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1));
  }

  .verification-seal:hover {
    /* Brand-bright variable for interactive states */
    color: var(--brand-color-bright, var(--brand-color, var(--color-text-950, #000)));
    filter: drop-shadow(0 0 4px color-mix(in oklch, var(--brand-color, currentColor) 50%, transparent));
    transform: rotate(90deg);
  }

  /* Dark mode relies on the site's root variables naturally updating, 
     but we ensure stroke visibility here. */
</style>
