<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';
  import { Coffee, Copy, Check } from '@lucide/svelte';

  const cryptos = [
    {
      label: 'XMR',
      coin: 'Monero',
      address: '44yH2LpkSsrSmWQC3SVmrABw2MUhNjNCE365hG7Rr7veJYNPBD1f6dNgXNr2nc6ZcP3jEyj9vXnqmg7VBBPeS8uwMhJ4yXW',
      preferred: true
    },
    {
      label: 'ETH',
      coin: 'Ethereum',
      address: '0x4B8c9d62ff89bc7199a197C55dac2abef1808B77'
    },
    {
      label: 'BTC',
      coin: 'Bitcoin',
      address: 'bc1qp3l6e9pjc5jan7ulpd58av8wfdtyhrchj84clh'
    }
  ];

  let copiedIndex = $state<number | null>(null);

  async function copyAddress(address: string, index: number) {
    await navigator.clipboard.writeText(address);
    copiedIndex = index;
    setTimeout(() => (copiedIndex = null), 2000);
  }
</script>

<SiteHead
  title="Support"
  description="Support my open-source work via Ko-fi, GitHub Sponsors, or cryptocurrency."
/>

<main class="shell-narrow">
  <header class="page-hd">
    <h1 class="page-title">Support</h1>
    <p class="page-desc">
      Everything I build is free and open-source. Your support keeps servers running,
      projects maintained, and new tools getting built.
    </p>
  </header>

  <section class="support-section">
    <h2 class="section-heading">Funding</h2>
    <div class="support-grid">
      <a
        href="https://ko-fi.com/ewancroft"
        target="_blank"
        rel="noopener noreferrer"
        class="post-row"
      >
        <span class="row-label">
          <Coffee size={16} strokeWidth={2} aria-hidden="true" />
          Ko-fi
        </span>
        <span class="row-meta">Buy me a tea</span>
      </a>
      <a
        href="https://github.com/sponsors/ewanc26"
        target="_blank"
        rel="noopener noreferrer"
        class="post-row"
      >
        <span class="row-label">GitHub Sponsors</span>
        <span class="row-meta">Sponsor work</span>
      </a>
    </div>
  </section>

  <section class="support-section">
    <h2 class="section-heading">Cryptocurrency</h2>
    <p class="section-note">Monero is preferred — the only genuinely private option.</p>
    <div class="crypto-grid">
      {#each cryptos as crypto, i}
        <div class="crypto-card">
          <div class="crypto-header">
            <span class="crypto-coin">{crypto.coin}</span>
            {#if crypto.preferred}
              <span class="pref-tag">Preferred</span>
            {/if}
          </div>
          <code class="crypto-addr">{crypto.address}</code>
          <button
            type="button"
            class="copy-btn"
            aria-label="Copy {crypto.coin} address"
            onclick={() => copyAddress(crypto.address, i)}
          >
            {#if copiedIndex === i}
              <Check size={12} strokeWidth={2.5} aria-hidden="true" />
              Copied
            {:else}
              <Copy size={12} strokeWidth={2} aria-hidden="true" />
              Copy
            {/if}
          </button>
        </div>
      {/each}
    </div>
  </section>

  <section class="support-section">
    <h2 class="section-heading">Other ways to help</h2>
    <ul class="help-list">
      <li class="help-item">
        <strong>Share.</strong> Word of mouth is the most effective way to grow open ecosystems.
      </li>
      <li class="help-item">
        <strong>Contribute.</strong> Report bugs, suggest features, or submit pull requests on GitHub.
      </li>
    </ul>
  </section>
</main>

<style>
  .support-section {
    margin-bottom: var(--space-xl);
  }

  .section-note {
    color: var(--color-ink-700);
    font-size: var(--text-sm);
    margin: 0 0 var(--space-md);
  }

  .row-label {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-weight: 600;
  }

  .row-meta {
    font-size: var(--text-sm);
    color: var(--color-ink-600);
  }

  /* Cryptocurrency Grid */
  .crypto-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-md);
  }

  .crypto-card {
    padding: var(--space-md);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .crypto-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .crypto-coin {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-ink-900);
  }

  .pref-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-primary-500);
    border: 1px solid currentColor;
    padding: 1px 6px;
    border-radius: var(--radius-xs);
  }

  .crypto-addr {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--color-ink-600);
    word-break: break-all;
    background: var(--surface-sunken);
    padding: var(--space-sm);
    border-radius: var(--radius-xs);
  }

  .copy-btn {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-primary-500);
    background: none;
    border: 1px solid currentColor;
    border-radius: var(--radius-xs);
    padding: 4px 8px;
    cursor: pointer;
    transition:
      background-color var(--duration-fast) var(--ease-out-quart),
      color var(--duration-fast) var(--ease-out-quart);
  }

  .copy-btn:hover {
    background: var(--color-primary-500);
    color: var(--color-canvas-50);
  }

  /* Other ways to help */
  .help-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .help-item {
    color: var(--color-ink-700);
    font-size: var(--text-md);
    line-height: 1.65;
  }
</style>
