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
    },
    {
      label: 'ZEC',
      coin: 'Zcash',
      address: 'u1xqmjwwpua38ay8esa4cxncxz79vj3dwq0k37nwzvz6w9aptrua6x2z0km287e8d5m87x956garz65a4432fl7cfn8j0uw9v085fx0372'
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
  ogSubtitle="Ko-fi, GitHub Sponsors, and cryptocurrency."
  ogType="SUPPORT"
/>

<main class="shell-narrow support">
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
    <ul class="bare-list">
      <li class="post-row">
        <div class="row-stack">
          <strong>Share</strong>
        </div>
        <span class="row-meta">Word of mouth</span>
      </li>
      <li class="post-row">
        <div class="row-stack">
          <strong>Contribute</strong>
        </div>
        <span class="row-meta">Bugs, features, PRs</span>
      </li>
    </ul>
  </section>
</main>
