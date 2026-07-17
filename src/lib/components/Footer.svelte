<script lang="ts">
  /**
   * Footer — site-wide footer.
   * Shows the current Sabbat name with an info modal trigger,
   * social links (Bluesky, Eurosky), the wolf mode toggle,
   * copyright, and quick links to contact/design/meta pages.
   */
  import { onMount } from 'svelte';
  import { Info } from '@lucide/svelte';
  import { WolfToggle } from '$lib/components/layout';
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
  import type { NormalizedSiteInfo } from '$lib/services/atproto/siteInfo';

  let { siteInfo = null }: { siteInfo?: NormalizedSiteInfo | null } = $props();

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
  const currentYear = new Date().getFullYear();
  let birthYear = $derived(siteInfo?.additionalInfo?.websiteBirthYear);
  let copyrightYears = $derived(
    birthYear && birthYear < currentYear ? `${birthYear}–${currentYear}` : `${currentYear}`
  );
  let primaryRepository = $derived(
    siteInfo?.openSourceInfo?.repositories.find((repository) => repository.type === 'primary')
      ?? siteInfo?.openSourceInfo?.repositories[0]
  );
  let projectLicense = $derived(siteInfo?.openSourceInfo?.license);
  let contactEmail = $derived(siteInfo?.additionalInfo?.contact?.email ?? 'contact@ewancroft.uk');

  // Easter egg #4 — Mōnandæg footer label (client-side, respects local timezone)

  onMount(() => {
    currentSabbat = getCurrentSabbat(new Date());
  });
</script>

{#if currentSabbat}
  <SabbatModal sabbat={showModal ? currentSabbat : null} onClose={() => showModal = false} />
{/if}

<footer class="site-footer">
  <div class="footer-inner">
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
        <WolfToggle />
      </div>
    </div>

    <div class="footer-section footer-center">
      <p>&copy; {copyrightYears} ewan croft</p>
    </div>

    <nav class="footer-section footer-right" aria-label="Footer navigation">
      <a href={`mailto:${contactEmail}`} class="footer-link">{contactEmail}</a>
      {#if primaryRepository}
        <a href={primaryRepository.url} rel="noopener" class="footer-link">source</a>
      {/if}
      {#if projectLicense?.url}
        <a href={projectLicense.url} rel="license noopener" class="footer-link">{projectLicense.name ?? 'license'}</a>
      {/if}
      <a href="/site/design" class="footer-link">design</a>
      <a href="/site/meta" class="footer-link">site meta &amp; privacy</a>
    </nav>
  </div>
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
