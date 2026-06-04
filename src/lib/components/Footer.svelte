<script lang="ts">
  import { onMount } from 'svelte';
  import { getCurrentSabbat, type Sabbat } from '$lib/utils/sabbats';
  import SabbatModal from './SabbatModal.svelte';
  import Bluesky from '$lib/components/icons/Bluesky.svelte';
  import Eurosky from '$lib/components/icons/Eurosky.svelte';
  import { PUBLIC_ATPROTO_DID } from '$env/static/public';

  let currentSabbat = $state<Sabbat | null>(null);
  let showModal = $state(false);

  onMount(() => {
    currentSabbat = getCurrentSabbat();
  });
</script>

{#if currentSabbat}
  <SabbatModal sabbat={showModal ? currentSabbat : null} onClose={() => showModal = false} />
{/if}

<footer class="site-footer">
  <div class="footer-left">
    {#if currentSabbat}
      <span class="sabbat-label">
        {currentSabbat.name}
        <button onclick={() => showModal = true} class="info-btn" aria-label="More info about {currentSabbat.name}">?</button>
      </span>
    {/if}
  </div>

  <div class="footer-symbols">
    <a href="https://bsky.app/profile/{PUBLIC_ATPROTO_DID}" aria-label="Bluesky" class="footer-icon-link">
      <Bluesky size={14} />
    </a>
    <a href="https://eurosky.tech" aria-label="Eurosky" class="footer-icon-link">
      <Eurosky size={14} />
    </a>
  </div>
  <p>&copy; {new Date().getFullYear()} ewan croft</p>
  <nav class="footer-nav">
    <a href="mailto:contact@ewancroft.uk" class="footer-link">contact@ewancroft.uk</a>
    <a href="/site/design" class="footer-link">design</a>
    <a href="/site/meta" class="footer-link">site meta</a>
  </nav>
</footer>

<style>
  .sabbat-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-600);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }
  .info-btn {
    background: none;
    border: 1px solid var(--color-text-600);
    border-radius: 50%;
    width: 16px;
    height: 16px;
    font-size: 10px;
    cursor: pointer;
    color: var(--color-text-600);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  .info-btn:hover {
    color: var(--color-primary-500);
    border-color: var(--color-primary-500);
  }
</style>
