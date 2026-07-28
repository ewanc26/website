<script lang="ts">
import SiteHead from '$lib/components/SiteHead.svelte';
import { Coffee } from '@lucide/svelte';
</script>

<SiteHead
  title="Support"
  description="Support my open-source work via Ko-fi or GitHub Sponsors."
  ogSubtitle="Ko-fi and GitHub Sponsors."
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
