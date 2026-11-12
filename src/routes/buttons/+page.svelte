<script lang="ts">
  import Slab from "$lib/components/Slab.svelte";
  import SeoHead from "$lib/components/SeoHead.svelte";

  let { data } = $props();

  const snippet = `<a href="https://ewancroft.uk">
  <img
    src="https://ewancroft.uk/assets/button-88x31.svg"
    width="88"
    height="31"
    alt="Ewan Croft — ewancroft.uk"
  >
</a>`;

  let copied = $state(false);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // Clipboard unavailable — the snippet is right there to copy by hand.
    }
  }
</script>

<SeoHead
  title="Buttons"
  description="My 88×31 web button — pixel wolf, name, and domain. Grab the swap snippet, then leave one of yours."
  ogSubtitle="88×31, plotted pixel by pixel."
  ogType="BUTTONS"
  siteInfo={data.siteInfo}
/>

<main class="wrap">
  <Slab word="Buttons" />
  <p class="lede">
    88 pixels wide, 31 tall — the web's smallest handshake. Mine is plotted pixel by pixel: wolf, name, domain. Take one, leave one.
  </p>

  <div class="cols thunk" style="--i:1">
    <h2>Mine</h2>
    <div>
      <figure class="plate">
        <img
          class="badge"
          src="/assets/button-88x31.svg"
          width="88"
          height="31"
          decoding="async"
          alt="Ewan Croft's 88×31 button: a green badge with a pixel wolf head, the name EWAN CROFT and the domain EWANCROFT.UK"
        />
        <img
          class="badge badge-2x"
          src="/assets/button-88x31.svg"
          width="176"
          height="62"
          decoding="async"
          alt=""
          aria-hidden="true"
        />
        <figcaption class="hud">88×31 · SVG · 5.4 KB</figcaption>
      </figure>

      <div class="snippet">
        <div class="snippet-head">
          <span class="hud">Swap snippet</span>
          <button class="copy" type="button" onclick={copySnippet}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre><code>{snippet}</code></pre>
      </div>

      <p class="note">Hotlink it or save a copy — either is fine. No tracking, just pixels.</p>
    </div>
  </div>

  <div class="cols thunk" style="--i:2">
    <h2>Yours</h2>
    <div>
      <ul class="shelf">
        <li class="shelf-item">
          <span class="shelf-name">Your button here</span>
          <span class="shelf-meta">the shelf is waiting</span>
        </li>
      </ul>
      <p class="note">
        Got a button of your own? Send it over on
        <a href="https://bsky.app/profile/ewancroft.uk" rel="noopener noreferrer">Bluesky</a>
        or by email at
        <a href="mailto:contact@ewancroft.uk">contact@ewancroft.uk</a>
        and it goes on the shelf.
      </p>
    </div>
  </div>
</main>

<style>
  .plate {
    margin-block: var(--space-lg);
    padding: var(--space-lg);
    border: var(--edge) solid var(--ink);
    background: var(--paper);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
    width: fit-content;
    max-width: 100%;
  }

  @media (max-width: 30rem) {
    .plate {
      padding: var(--space-md);
    }
  }

  .badge {
    display: block;
    image-rendering: pixelated;
  }

  .badge-2x {
    margin-block-start: var(--space-xs);
  }

  .hud {
    font-family: var(--font-pixel);
    font-size: var(--text-micro);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .snippet {
    border: var(--edge) solid var(--ink);
    background: var(--paper);
  }

  .snippet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-block-end: var(--edge) solid var(--ink);
  }

  .copy {
    font-family: var(--font-pixel);
    font-size: var(--text-micro);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: var(--space-xs) var(--space-md);
    border: var(--edge) solid var(--ink);
    background: var(--riso-a);
    color: var(--on-ink);
    cursor: pointer;
  }

  .copy:hover {
    background: var(--riso-b);
  }

  .copy:active {
    translate: 0 2px;
  }

  .snippet pre {
    margin: 0;
    padding: var(--space-md);
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: 1.5;
  }
</style>
