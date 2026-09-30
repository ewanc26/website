<script lang="ts">
  import ArrowUpRight from "$lib/components/icons/ArrowUpRight.svelte";
  import SeoHead from "$lib/components/SeoHead.svelte";
  import Slab from "$lib/components/Slab.svelte";
  import HalftoneMoon from "$lib/components/HalftoneMoon.svelte";
  import PixelMoon from "$lib/components/PixelMoon.svelte";
  import { sabbats } from "$lib/utils/sabbats";

  let { data } = $props();
  const info = $derived(data.info);
  const almanac = $derived(data.almanac);
  const a = $derived(info?.additionalInfo);
  const os = $derived(info?.openSourceInfo);

  function bySection<T extends { section?: string }>(items: T[]) {
    const m = new Map<string, T[]>();
    for (const i of items) m.set(i.section ?? "Other", [...(m.get(i.section ?? "Other") ?? []), i]);
    return [...m.entries()];
  }

  const swatches: [string, string][] = [
    ["Paper", "--paper"],
    ["Deep paper", "--paper-deep"],
    ["Ink", "--ink"],
    ["Ink one", "--riso-a"],
    ["Ink two", "--riso-b"],
  ];
</script>

<SeoHead
  title="This Site"
  description={a?.purpose ?? "How this site is made and run: design, tech stack, privacy, and credits."}
  ogSubtitle="Design, tech stack, privacy, and credits."
  ogType="SITE_META"
  siteInfo={data.info}
/>

<main class="wrap">
  <Slab word="This Site" long />
  {#if !info}<p class="empty">Site information could not be loaded just now.</p>{/if}

  <p class="lede">
    This is a risograph zine that thinks it's a game cartridge shelf. Two spot inks, set by the season; newsprint by day, black stock
    by night; type that's either colossal or pixels.
  </p>

  {#if a?.purpose}
    <div class="cols thunk" style="--i:1">
      <h2>Purpose</h2>
      <div>
        <p class="lede" style="margin:0">{a.purpose}</p>
        {#if a.websiteBirthYear}<p class="note">First launched in {a.websiteBirthYear}.</p>{/if}
      </div>
    </div>
  {/if}

  {#if info?.privacyStatement || a?.analytics}
    <div class="cols thunk" style="--i:2">
      <h2>Privacy</h2>
      <div>
        {#if info?.privacyStatement}<p>{info.privacyStatement}</p>{/if}
        {#if a?.analytics}
          <dl class="dl" style="margin-top:1rem">
            <dt>Analytics</dt>
            <dd>{a.analytics.services.length ? a.analytics.services.join(", ") : "None declared."}</dd>
            {#if a.analytics.cookiePolicy}
              <dt>Cookies</dt>
              <dd>{a.analytics.cookiePolicy}</dd>
            {/if}
          </dl>
        {/if}
      </div>
    </div>
  {/if}

  <div class="cols thunk" style="--i:3">
    <h2>Rules</h2>
    <ol class="prose" style="max-width:none">
      <li>
        <strong>Two inks, one black.</strong> Everything else is those three colours, overprinted with a screen or multiply blend so
        overlaps make a third. No gradients except the halftone dot screen a riso press actually makes.
      </li>
      <li>
        <strong>Cut, not rounded.</strong> Every corner is square. Circles exist only for the moon and the buttons that are meant to look
        punched.
      </li>
      <li>
        <strong>Colossal or pixel.</strong> Section words are printed at poster scale, cropped by the sheet; small text is Pixelify Sans,
        like a game's HUD.
      </li>
      <li><strong>Nothing floats.</strong> No cards with shadows. Panels sit flat and are told apart by ink, rules and slight rotation.</li>
      <li><strong>Stepped motion.</strong> Things arrive in steps, like a print run advancing, not eased like an app.</li>
    </ol>
  </div>

  <div class="cols thunk" style="--i:4">
    <h2>Type</h2>
    <div>
      <p class="slab" data-t="Aa" style="font-size:6rem;margin:0 0 1rem">Aa</p>
      <p class="prose" style="max-width:none">
        Archivo (width axis pushed wide) carries every headline. Atkinson Hyperlegible Next — built for legibility, not for looks —
        carries the reading. Pixelify Sans is the game-UI voice: labels, metadata, buttons. JetBrains Mono is reserved for code.
      </p>
    </div>
  </div>

  <div class="cols thunk" style="--i:5">
    <h2>Colour</h2>
    <div>
      <ul class="carts" style="grid-template-columns:repeat(auto-fill,minmax(9rem,1fr))">
        {#each swatches as [name, v] (v)}
          <li class="cart" style="rotate:0">
            <span class="cart-band" style={`background:var(${v})`}></span>
            <span class="cart-body"><span class="cart-no">{v}</span><span class="cart-name" style="font-size:1.1rem">{name}</span></span>
          </li>
        {/each}
      </ul>
      <p class="prose" style="max-width:none;margin-top:1rem">
        Both inks are generated in OKLCH from the same seasonal hue the old site used — one direct, one ~150° round the wheel — so
        the whole site's palette turns with the Wheel of the Year.
      </p>
    </div>
  </div>

  <div class="cols thunk" style="--i:6">
    <h2>The moon</h2>
    <div style="display:flex;flex-wrap:wrap;gap:2rem;align-items:center">
      <div style="width:8rem;color:var(--riso-a)"><HalftoneMoon phase={almanac.moon.phase} id="dsmoon" class="stamp" /></div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;max-width:20rem">
        {#each Array.from({ length: 8 }, (_, i) => i / 8) as p (p)}
          <PixelMoon phase={p} size={26} />
        {/each}
      </div>
      <p class="prose" style="flex:1;min-width:16rem;max-width:none">
        Tonight: {almanac.moon.name.toLowerCase()}, at {almanac.sabbat.name}. Next sabbat: {almanac.next.name}, in {almanac.next.days} days.
        The eight: {sabbats.map((s) => s.name).join(", ")}.
      </p>
    </div>
  </div>

  {#if info && info.technologyStack.length > 0}
    <div class="cols thunk" style="--i:7">
      <h2>Built with</h2>
      <div>
        {#each bySection(info.technologyStack) as [section, list] (section)}
          <div style="margin-bottom:1.5rem">
            <p class="pix" style="margin-bottom:.5rem;color:var(--riso-a-text)">{section}</p>
            <dl class="dl">
              {#each list as t (t.name)}
                <dt>{t.name}</dt>
                <dd>{#if t.url}<a href={t.url} rel="noopener">{t.description ?? t.url}</a>{:else}{t.description}{/if}</dd>
              {/each}
            </dl>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if os}
    <div class="cols thunk" style="--i:8">
      <h2>Open source</h2>
      <div>
        {#if os.description}<p>{os.description}</p>{/if}
        <dl class="dl" style="margin-top:1rem">
          {#if os.license}
            <dt>Licence</dt>
            <dd>{#if os.license.url}<a href={os.license.url} rel="license noopener">{os.license.name ?? "View licence"}</a>{:else}{os.license.name}{/if}</dd>
          {/if}
          {#each os.repositories as r (r.url)}
            <dt>{r.type ?? "Repo"}</dt>
            <dd><a href={r.url} rel="noopener">{r.description || r.url}</a>{#if r.platform}<span class="chip">{r.platform}</span>{/if}</dd>
          {/each}
          {#each os.relatedServices as s (s.name)}
            <dt>{s.relationship ?? "Related"}</dt>
            <dd>{#if s.url}<a href={s.url} rel="noopener">{s.name}</a>{:else}{s.name}{/if}{#if s.description}&mdash; {s.description}{/if}</dd>
          {/each}
        </dl>
      </div>
    </div>
  {/if}

  <div class="cols thunk" style="--i:9">
    <h2>Design sources</h2>
    <div>
      <p class="prose" style="max-width:none">
        The open source underneath the design specifically, checked against the packages actually installed rather than the
        hand-written record above, which can lag behind what's running.
      </p>
      <ul class="shelf" style="margin-top:1.5rem">
        <li>
          <a href="https://tailwindcss.com" rel="noopener"><span class="shelf-name">Tailwind CSS</span><span class="shelf-meta">MIT<ArrowUpRight /></span></a>
          <p class="shelf-note">The utility-class reset and layer system everything else sits on top of.</p>
        </li>
        <li>
          <a href="https://fontsource.org" rel="noopener"><span class="shelf-name">Fontsource</span><span class="shelf-meta">MIT<ArrowUpRight /></span></a>
          <p class="shelf-note">Self-hostable open-source fonts as npm packages — no Google Fonts CDN request on this site.</p>
        </li>
        <li>
          <a href="https://fontsource.org/fonts/archivo" rel="noopener"><span class="shelf-name">Archivo</span><span class="shelf-meta">OFL-1.1<ArrowUpRight /></span></a>
          <p class="shelf-note">The display face — every headline and section word.</p>
        </li>
        <li>
          <a href="https://fontsource.org/fonts/atkinson-hyperlegible-next" rel="noopener">
            <span class="shelf-name">Atkinson Hyperlegible Next</span><span class="shelf-meta">OFL-1.1<ArrowUpRight /></span>
          </a>
          <p class="shelf-note">
            Commissioned by the Braille Institute of America specifically for letter-level legibility, not looks. Carries the reading.
          </p>
        </li>
        <li>
          <a href="https://fontsource.org/fonts/pixelify-sans" rel="noopener"><span class="shelf-name">Pixelify Sans</span><span class="shelf-meta">OFL-1.1<ArrowUpRight /></span></a>
          <p class="shelf-note">The game-UI voice — labels, metadata, buttons.</p>
        </li>
        <li>
          <a href="https://fontsource.org/fonts/jetbrains-mono" rel="noopener"><span class="shelf-name">JetBrains Mono</span><span class="shelf-meta">OFL-1.1<ArrowUpRight /></span></a>
          <p class="shelf-note">Reserved for code.</p>
        </li>
        <li>
          <a href="https://lucide.dev" rel="noopener"><span class="shelf-name">Lucide</span><span class="shelf-meta">ISC<ArrowUpRight /></span></a>
          <p class="shelf-note">The icon set behind every plain glyph on the site.</p>
        </li>
        <li>
          <a href="https://svelte.dev" rel="noopener"><span class="shelf-name">SvelteKit</span><span class="shelf-meta">MIT<ArrowUpRight /></span></a>
          <p class="shelf-note">Renders the whole site and drives every reactive piece — the live theme, the comment form, the now-playing strip.</p>
        </li>
      </ul>
    </div>
  </div>

  {#if a?.deployment || (a?.sectionLicense.length ?? 0) > 0}
    <div class="cols thunk" style="--i:10">
      <h2>Operations</h2>
      <dl class="dl">
        {#if a?.deployment}
          <dt>Hosting</dt>
          <dd>{[a.deployment.platform, a.deployment.cdn].filter(Boolean).join(" · ")}{a.deployment.customDomain ? " · custom domain" : ""}</dd>
        {/if}
        {#each a?.sectionLicense ?? [] as l (l.section ?? l.name)}
          <dt>{l.section ?? "Licence"}</dt>
          <dd>{#if l.url}<a href={l.url} rel="license noopener">{l.name ?? l.url}</a>{:else}{l.name}{/if}</dd>
        {/each}
      </dl>
    </div>
  {/if}

  {#if info && info.credits.length > 0}
    <div class="cols thunk" style="--i:11">
      <h2>Credits</h2>
      <div>
        {#each bySection(info.credits) as [section, list] (section)}
          <div style="margin-bottom:1.5rem">
            <p class="pix" style="margin-bottom:.5rem;color:var(--riso-a-text)">{section}</p>
            <ul class="shelf">
              {#each list as c (c.name)}
                <li>
                  <div class="shelf-item">
                    <span class="shelf-name">{#if c.url}<a href={c.url} rel="noopener">{c.name}</a>{:else}{c.name}{/if}</span>
                    <span class="shelf-meta">{c.type}{c.author ? ` · ${c.author}` : ""}</span>
                    {#if c.description}<p class="shelf-note">{c.description}</p>{/if}
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</main>
