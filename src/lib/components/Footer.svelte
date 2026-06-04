<script lang="ts">
  import { onMount } from 'svelte';
  import { Info } from '@lucide/svelte';
  import { getCurrentSabbat, type Sabbat } from '$lib/utils/sabbats';
  import SabbatModal from './SabbatModal.svelte';
  import Bluesky from '$lib/components/icons/Bluesky.svelte';
  import Eurosky from '$lib/components/icons/Eurosky.svelte';
  import Beltane from '$lib/components/icons/sabbats/Beltane.svelte';
  import Imbolc from '$lib/components/icons/sabbats/Imbolc.svelte';
  import Litha from '$lib/components/icons/sabbats/Litha.svelte';
  import Lughnasadh from '$lib/components/icons/sabbats/Lughnasadh.svelte';
  import Mabon from '$lib/components/icons/sabbats/Mabon.svelte';
  import Ostara from '$lib/components/icons/sabbats/Ostara.svelte';
  import Samhain from '$lib/components/icons/sabbats/Samhain.svelte';
  import Yule from '$lib/components/icons/sabbats/Yule.svelte';
  import { PUBLIC_ATPROTO_DID } from '$env/static/public';

  const SabbatIcons: Record<string, any> = {
    Beltane,
    Imbolc,
    Litha,
    Lughnasadh,
    Mabon,
    Ostara,
    Samhain,
    Yule,
  };

  let currentSabbat = $state<Sabbat | null>(null);
  let showModal = $state(false);

  let SabbatIcon = $derived(currentSabbat ? SabbatIcons[currentSabbat.name] : null);

  onMount(() => {
    currentSabbat = getCurrentSabbat();
  });
</script>

{#if currentSabbat}
  <SabbatModal sabbat={showModal ? currentSabbat : null} onClose={() => showModal = false} />
{/if}

<footer class="site-footer">
  <div class="footer-section footer-left">
    {#if currentSabbat && SabbatIcon}
      <span class="sabbat-label">
        <SabbatIcon size={14} />
        {currentSabbat.name}
        <button onclick={() => showModal = true} class="info-btn" aria-label="More info about {currentSabbat.name}">
          <Info size={14} />
        </button>
      </span>
    {/if}
    <div class="footer-symbols">
      <a href="https://bsky.app/profile/{PUBLIC_ATPROTO_DID}" aria-label="Bluesky" class="footer-icon-link">
        <Bluesky size={14} />
      </a>
      <a href="https://eurosky.tech" aria-label="Eurosky" class="footer-icon-link">
        <Eurosky size={14} />
      </a>
    </div>
  </div>

  <div class="footer-section footer-center">
    <p>&copy; {new Date().getFullYear()} ewan croft</p>
  </div>

  <nav class="footer-section footer-right">
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
    border: none;
    cursor: pointer;
    color: var(--color-text-600);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px; /* Expands touch area */
    flex-shrink: 0;
  }
  .info-btn:hover {
    color: var(--color-primary-500);
  }
</style>
