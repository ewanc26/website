<script lang="ts">
  /**
   * VerificationBadge.svelte
   *
   * Clickable "seal" badge — opens a small modal explaining what the
   * mark means and who/what backs it, mirroring the structure/styling
   * of SabbatModal.svelte (dialog + modal-content + modal-header).
   *
   * Note: this component renders inside an <h1>, so the modal needs an
   * explicit font reset — otherwise its text inherits the page-title's
   * huge, bold styling via normal CSS cascade.
   *
   * Edit `verifiedBy` / the body copy below to point at whatever you
   * want this to actually claim (DID, PDS, a specific attestation, etc).
   */
  import { X } from '@lucide/svelte';
  import BaseModal from './BaseModal.svelte';
  import VerifierCard from './VerifierCard.svelte';

  interface Verifier {
    did: string;
    name: string;
    avatarUrl?: string;
    date: string;
    handle?: string; // Add handle to support lexicon
  }

  interface Props {
    verified?: boolean;
    label?: string;
    verifiers?: Verifier[];
  }

  let {
    verified = false,
    label = "Verified",
    verifiers = []
  }: Props = $props();

  let open = $state(false);

  function close() {
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if verified}
  <button
    type="button"
    class="verification-seal"
    title={label}
    aria-label={`${label} — view details`}
    aria-haspopup="dialog"
    aria-expanded={open}
    onclick={() => (open = true)}
  >
    <svg
      viewBox="0 0 20 20"
      class="verification-icon"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="14.2" cy="10" r="4.2" fill="currentColor" />
      <circle cx="12.97" cy="12.97" r="4.2" fill="currentColor" />
      <circle cx="10" cy="14.2" r="4.2" fill="currentColor" />
      <circle cx="7.03" cy="12.97" r="4.2" fill="currentColor" />
      <circle cx="5.8" cy="10" r="4.2" fill="currentColor" />
      <circle cx="7.03" cy="7.03" r="4.2" fill="currentColor" />
      <circle cx="10" cy="5.8" r="4.2" fill="currentColor" />
      <circle cx="12.97" cy="7.03" r="4.2" fill="currentColor" />
      <path
        d="M6.5 10.2L9 12.7L13.5 7.5"
        fill="none"
        stroke="var(--color-background-50)"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>

  <BaseModal 
    title={verified ? "I'm verified" : "Verification details"}
    {open}
    onClose={close}
  >
    <p>
      {verified
        ? "This account has a checkmark because it's been verified by trusted sources."
        : "This account has one or more attempted verifications, but it is not currently verified."}
    </p>
    {#if verifiers.length}
      <div class="verified-by">
        <h3 class="verified-by-title">Verified by</h3>
        <div class="verified-by-list">
          {#each verifiers.slice(0, 3) as verifier}
            <VerifierCard {...verifier} />
          {/each}
          {#if verifiers.length > 3}
            <p class="more-verifiers">and {verifiers.length - 3} more</p>
          {/if}
        </div>
      </div>
    {/if}

    {#snippet footer()}
      <button class="btn btn-secondary" onclick={close}>Close</button>
      <a href="https://bsky.social/about/blog/04-21-2025-verification" target="_blank" rel="noopener" class="btn btn-primary">Learn more</a>
    {/snippet}
  </BaseModal>
{/if}


<style>
  /* ── Seal trigger ─────────────────────────────────────────────── */
.verification-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.25em;
  /* Use baseline alignment, and rely on flex to center the icon */
  vertical-align: baseline;

  /* Reset button chrome */
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  /* Tied to the dynamic seasonal accent */
  color: var(--color-primary-500);

  transition:
    color var(--duration-fast) var(--ease-out-quart),
    transform var(--duration-fast) var(--ease-out-quart);
}

.verification-seal:hover {
  color: var(--color-primary-400);
  transform: scale(1.1);
}

.verification-icon {
  /* Use line-height unit for perfect scaling with text */
  width: 2.5lh;
  height: 2.5lh;
  flex-shrink: 0;
}

  /* ── Verified List ─────────────────────────────────────────────── */

  .verified-by {
    border-top: 1px solid var(--surface-color);
    padding-top: var(--space-md);
  }

  .verified-by-title {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-600);
    margin: 0 0 var(--space-sm);
  }

  .verified-by-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .more-verifiers {
    font-size: var(--text-xs);
    color: var(--color-text-600);
    margin: var(--space-xs) 0 0 0;
    padding-left: var(--space-sm);
  }
</style>
