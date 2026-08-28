<script lang="ts">
import SiteHead from '$lib/components/SiteHead.svelte';
import { Coffee, GitPullRequest, Heart } from '@lucide/svelte';
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
    <h2 class="section-heading">Support directly</h2>
    <div class="support-grid">
      <a
        href="https://ko-fi.com/ewancroft"
        target="_blank"
        rel="noopener noreferrer"
        class="post-row"
        aria-label="Support with a one-time or monthly payment on Ko-fi"
      >
        <span class="row-label">
          <Coffee size={16} strokeWidth={2} aria-hidden="true" />
          Ko-fi
        </span>
        <span class="row-meta">One-time or monthly</span>
      </a>
      <a
        href="https://github.com/sponsors/ewanc26"
        target="_blank"
        rel="noopener noreferrer"
        class="post-row"
        aria-label="Sponsor with a one-time or monthly payment on GitHub"
      >
        <span class="row-label">
          <Heart size={16} strokeWidth={2} aria-hidden="true" />
          GitHub Sponsors
        </span>
        <span class="row-meta">One-time or monthly</span>
      </a>
    </div>

    <div class="payment-panel" id="ko-fi-payment">
      <iframe
        src="https://ko-fi.com/ewancroft/?hidefeed=true&widget=true&embed=true&preview=true"
        title="Support Ewan through Ko-fi"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>

    <p class="section-note payment-note">
      Payments are handled securely by Ko-fi or GitHub. This site never receives your payment
      details.
    </p>
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
          <a
            href="https://github.com/ewanc26"
            target="_blank"
            rel="noopener noreferrer"
            class="row-label"
            aria-label="Explore ways to contribute on Ewan's GitHub profile"
          >
            <GitPullRequest size={16} strokeWidth={2} aria-hidden="true" />
            <strong>Contribute</strong>
          </a>
        </div>
        <span class="row-meta">Bugs, features, PRs</span>
      </li>
    </ul>
  </section>
</main>
