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
    <ul class="bare-list">
      <li>
        <a
          href="https://ko-fi.com/ewancroft"
          target="_blank"
          rel="noopener noreferrer"
          class="post-row"
        >
          <span class="row-label">
            <Coffee size={14} strokeWidth={2} aria-hidden="true" />
            Ko-fi
          </span>
          <span class="row-meta">Buy me a tea</span>
        </a>
      </li>
      <li>
        <a
          href="https://github.com/sponsors/ewanc26"
          target="_blank"
          rel="noopener noreferrer"
          class="post-row"
        >
          <span class="row-label">
            GitHub Sponsors
          </span>
          <span class="row-meta">Sponsor work</span>
        </a>
      </li>
    </ul>
  </section>

  <section class="support-section">
    <h2 class="section-heading">Cryptocurrency</h2>
    <p class="section-note">Monero is preferred — the only genuinely private option.</p>
    <ul class="bare-list crypto-list">
      {#each cryptos as crypto, i}
        <li class="crypto-item">
          <div class="crypto-header">
            <span class="crypto-coin">{crypto.coin}</span>
            {#if crypto.preferred}
              <span class="pref-tag">preferred</span>
            {/if}
          </div>
          <div class="crypto-body">
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
        </li>
      {/each}
    </ul>
  </section>

  <section class="support-section">
    <h2 class="section-heading">Other ways to help</h2>
    <ul class="help-list">
      <li>
        Share these tools with your community. Word of mouth is the most effective
        way to grow open ecosystems.
      </li>
      <li>
        Report bugs, suggest features, or submit pull requests on GitHub. Technical
        contributions are as valuable as funding.
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

  /* Shared list reset */
  .bare-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* Funding rows — uses global .post-row, local label/meta only */
  .row-label {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-weight: 600;
  }

  .row-meta {
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    flex-shrink: 0;
  }

  /* Crypto */
  .crypto-list {
    display: flex;
    flex-direction: column;
  }

  .crypto-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-md) 0;
    border-bottom: 1px dashed var(--surface-color);
  }

  .crypto-item:last-child {
    border-bottom: none;
  }

  .crypto-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
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
    line-height: 1.6;
  }

  .crypto-body {
    display: flex;
    gap: var(--space-sm);
    align-items: flex-start;
  }

  .crypto-addr {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--color-ink-600);
    word-break: break-all;
    line-height: 1.55;
    background: none;
    border: none;
    padding: 0;
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-primary-500);
    background: none;
    border: 1px solid currentColor;
    border-radius: var(--radius-xs);
    padding: 3px 8px;
    cursor: pointer;
    flex-shrink: 0;
    line-height: 1.5;
    transition:
      background-color var(--duration-fast) var(--ease-out-quart),
      color var(--duration-fast) var(--ease-out-quart);
  }

  .copy-btn:hover {
    background: var(--color-primary-500);
    color: var(--color-canvas-50);
  }

  @media (max-width: 480px) {
    .crypto-body {
      flex-direction: column;
    }

    .copy-btn {
      align-self: flex-start;
    }
  }

  /* Other ways to help */
  .help-list {
    margin: 0;
    padding-left: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .help-list li {
    color: var(--color-ink-700);
    font-size: var(--text-sm);
    line-height: 1.65;
  }
</style>
