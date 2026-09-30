<script lang="ts">
  import ArrowUpRight from "$lib/components/icons/ArrowUpRight.svelte";
  import Slab from "$lib/components/Slab.svelte";
  import SeoHead from "$lib/components/SeoHead.svelte";

  let { data } = $props();
</script>

<SeoHead
  title="Support"
  description="Support my open-source work via Ko-fi or GitHub Sponsors."
  ogSubtitle="Ko-fi and GitHub Sponsors."
  ogType="SUPPORT"
  siteInfo={data.siteInfo}
/>

<main class="wrap">
  <Slab word="Support" />
  <p class="lede">
    Everything I build is free and open-source. Your support keeps servers running, projects maintained, and new tools getting built.
  </p>

  <div class="cols thunk" style="--i:1">
    <h2>Directly</h2>
    <div>
      <ul class="shelf">
        <li>
          <a href="https://ko-fi.com/ewancroft" rel="noopener noreferrer" aria-label="Support with a one-time or monthly payment on Ko-fi">
            <span class="shelf-name">Ko-fi</span><span class="shelf-meta">one-time or monthly<ArrowUpRight /></span>
          </a>
        </li>
        <li>
          <a
            href="https://github.com/sponsors/ewanc26"
            rel="noopener noreferrer"
            aria-label="Sponsor with a one-time or monthly payment on GitHub"
          >
            <span class="shelf-name">GitHub Sponsors</span><span class="shelf-meta">one-time or monthly<ArrowUpRight /></span>
          </a>
        </li>
      </ul>
      <iframe
        class="kofi-frame"
        src="https://ko-fi.com/ewancroft/?hidefeed=true&widget=true&embed=true&preview=true"
        title="Support Ewan through Ko-fi"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
      <p class="note">Payments are handled securely by Ko-fi or GitHub. This site never receives your payment details.</p>
    </div>
  </div>

  <div class="cols thunk" style="--i:2">
    <h2>Otherwise</h2>
    <ul class="shelf">
      <li class="shelf-item"><span class="shelf-name">Share</span><span class="shelf-meta">word of mouth</span></li>
      <li>
        <a href="https://github.com/ewanc26" rel="noopener noreferrer" aria-label="Explore ways to contribute on Ewan's GitHub profile">
          <span class="shelf-name">Contribute</span><span class="shelf-meta">bugs, features, PRs<ArrowUpRight /></span>
        </a>
      </li>
    </ul>
  </div>
</main>

<style>
  :global(.kofi-frame) {
    width: 100%;
    height: 34rem;
    margin-block: var(--space-lg);
    border: var(--edge) solid var(--ink);
    background: #fff;
  }
</style>
