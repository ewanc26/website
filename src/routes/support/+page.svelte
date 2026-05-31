<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';
  import { Coffee, Globe, Heart } from '@lucide/svelte';

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

<main class="shell-narrow spec-sheet">
  <!-- ── Spec Header ──────────────────────────────── -->
  <header class="spec-header">
    <div class="spec-meta">
      <span class="meta-tag">SPEC-003</span>
      <span class="meta-tag">FUNDING</span>
      <span class="meta-tag">EXTERNAL</span>
    </div>
    <div class="header-main">
      <h1 class="spec-title">Support Registry</h1>
      <p class="spec-abstract">
        Everything I build is free and open-source. Your support ensures the continued maintenance, server hosting, and development of tools for the open social web.
      </p>
    </div>
  </header>

  <div class="spec-grid">
    <!-- ── [01] Fiat Funding ───────────────────────── -->
    <section class="spec-section fiat" id="fiat">
      <header class="section-hd">
        <span class="section-num">[01]</span>
        <h2 class="section-title">Fiat Funding</h2>
      </header>
      <div class="section-content">
        <div class="fiat-grid">
          <a href="https://ko-fi.com/ewancroft" target="_blank" rel="noopener noreferrer" class="funding-card">
            <div class="card-icon"><Coffee size={20} /></div>
            <div class="card-body">
              <span class="card-label">KO-FI</span>
              <span class="card-action">Buy me a tea</span>
            </div>
          </a>
          <a href="https://github.com/sponsors/ewanc26" target="_blank" rel="noopener noreferrer" class="funding-card">
            <div class="card-icon"><Globe size={20} /></div>
            <div class="card-body">
              <span class="card-label">GITHUB</span>
              <span class="card-action">Sponsor work</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- ── [02] Crypto Registry ────────────────────── -->
    <section class="spec-section crypto" id="crypto">
      <header class="section-hd">
        <span class="section-num">[02]</span>
        <h2 class="section-title">Crypto Registry</h2>
      </header>
      <div class="section-content">
        <div class="crypto-list">
          {#each cryptos as crypto, i}
            <div class="crypto-item">
              <div class="item-meta">
                <span class="coin-label">{crypto.label}</span>
                {#if crypto.preferred}
                  <span class="pref-badge">PREFERRED</span>
                {/if}
              </div>

              <div class="item-body">
                <code class="address">{crypto.address}</code>
                <button 
                  type="button" 
                  class="copy-btn"
                  onclick={() => copyAddress(crypto.address, i)}
                >
                  {copiedIndex === i ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- ── [03] Non-Financial ──────────────────────── -->
    <section class="spec-section community" id="community">
      <header class="section-hd">
        <span class="section-num">[03]</span>
        <h2 class="section-title">Community</h2>
      </header>
      <div class="section-content">
        <div class="manifesto-list">
          <article class="principle-card">
            <span class="p-num">01</span>
            <div class="p-body">
              <h3 class="p-name">Visibility</h3>
              <p class="p-desc">Share these tools with your community. Word of mouth is the most effective way to grow open ecosystems.</p>
            </div>
          </article>
          <article class="principle-card">
            <span class="p-num">02</span>
            <div class="p-body">
              <h3 class="p-name">Contribution</h3>
              <p class="p-desc">Report bugs, suggest features, or submit pull requests on GitHub. Technical labor is as valuable as funding.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</main>

<style>
  .spec-sheet {
    padding-top: var(--space-xl);
    padding-bottom: var(--space-2xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  /* ── Spec Header ──────────────────────────────── */
  .spec-header {
    padding-bottom: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .spec-meta {
    display: flex;
    gap: var(--space-sm);
  }

  .meta-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--color-ink-500);
    background: var(--surface-raised);
    padding: 2px 6px;
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-xs);
  }

  .spec-title {
    font-size: clamp(2.5rem, 8vw, 4rem);
    font-weight: 800;
    line-height: 0.9;
    letter-spacing: -0.04em;
    margin: 0;
    text-transform: uppercase;
  }

  .spec-abstract {
    margin: var(--space-md) 0 0;
    max-width: 60ch;
    font-size: var(--text-md);
    color: var(--color-ink-700);
    line-height: 1.5;
  }

  /* ── Spec Grid ────────────────────────────────── */
  .spec-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl);
  }

  .spec-section {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: var(--space-xl);
    border-top: 1px solid var(--surface-color);
    padding-top: var(--space-lg);
  }

  @media (max-width: 700px) {
    .spec-section {
      grid-template-columns: 1fr;
      gap: var(--space-md);
    }
  }

  .section-hd {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  .section-num {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-primary-500);
    font-weight: 700;
  }

  .section-title {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 800;
    margin: 0;
    color: var(--color-ink-950);
  }

  /* ── Fiat Funding ────────────────────────────── */
  .fiat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-md);
  }

  .funding-card {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--surface-raised);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--color-ink-950);
    transition: all var(--duration-fast) var(--ease-out-quart);
  }

  .funding-card:hover {
    border-color: var(--color-primary-500);
    background: var(--color-canvas-50);
  }

  .card-icon {
    color: var(--color-primary-500);
    display: flex;
  }

  .card-body {
    display: flex;
    flex-direction: column;
  }

  .card-label {
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 800;
    color: var(--color-ink-500);
    letter-spacing: 0.05em;
  }

  .card-action {
    font-size: var(--text-sm);
    font-weight: 700;
  }

  /* ── Crypto List ─────────────────────────────── */
  .crypto-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .crypto-item {
    background: var(--surface-raised);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .item-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .coin-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 800;
    color: var(--color-ink-950);
  }

  .pref-badge {
    font-family: var(--font-mono);
    font-size: 8px;
    background: var(--color-primary-500);
    color: var(--color-canvas-50);
    padding: 2px 6px;
    border-radius: var(--radius-xs);
  }

  .item-body {
    display: flex;
    gap: var(--space-md);
    align-items: center;
  }

  .address {
    flex: 1;
    font-size: 10px;
    color: var(--color-ink-600);
    word-break: break-all;
    line-height: 1.4;
    background: var(--color-canvas-50);
    padding: var(--space-xs) var(--space-sm);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-sm);
  }

  .copy-btn {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 800;
    color: var(--color-primary-500);
    background: none;
    border: 1px solid var(--color-primary-500);
    border-radius: var(--radius-sm);
    padding: 4px 8px;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out-quart);
    flex-shrink: 0;
  }

  .copy-btn:hover {
    background: var(--color-primary-500);
    color: var(--color-canvas-50);
  }

  @media (max-width: 500px) {
    .item-body {
      flex-direction: column;
      align-items: stretch;
    }
  }

  /* ── Manifesto Style ─────────────────────────── */
  .manifesto-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .principle-card {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: var(--space-md);
  }

  .p-num {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 800;
    color: var(--color-primary-500);
  }

  .p-name {
    font-size: var(--text-sm);
    font-weight: 800;
    margin: 0 0 2px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .p-desc {
    font-size: var(--text-xs);
    color: var(--color-ink-700);
    margin: 0;
    line-height: 1.6;
    max-width: 60ch;
  }
</style>
