<script lang="ts">
  /**
   * Refactored VerificationBadge using Svelte 5 runes.
   * Replaced Lucide 'BadgeCheck' with a custom sparkle icon.
   * Inherits dynamic OKLCH color mappings.
   * Maintains 4pt grid layout (0.25rem = 4pt).
   */
  interface Props {
    verified?: boolean;
    label?: string;
  }

  let { verified = false, label = "Verified" }: Props = $props();
</script>

{#if verified}
  <div class="verification-badge">
    <!-- Custom Sparkle Icon -->
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      class="icon" 
      aria-hidden="true"
    >
      <path d="M12 1L14.89 8.22L22 11L14.89 13.78L12 21L9.11 13.78L2 11L9.11 8.22L12 1Z" />
    </svg>
    <span class="label">{label}</span>
  </div>
{/if}

<style>
  .verification-badge {
    /* 4pt grid layout adherence (0.25rem = 4pt) */
    display: inline-flex;
    align-items: center;
    gap: 0.25rem; /* 4pt */
    padding: 0.125rem 0.5rem; /* 2pt vertical, 8pt horizontal */
    
    /* Dynamic OKLCH color mappings */
    background-color: var(--badge-bg, oklch(0.92 0.04 240)); 
    color: var(--badge-fg, oklch(0.45 0.25 250));
    
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1;
  }

  .icon {
    /* 1rem = 16px (4 * 4pt) */
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
</style>