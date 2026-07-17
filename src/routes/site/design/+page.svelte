<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';
  import TableOfContents from '$lib/components/TableOfContents.svelte';
  import Bluesky from '$lib/components/icons/Bluesky.svelte';
  import Pentacle from '$lib/components/icons/Pentacle.svelte';
  import Triskele from '$lib/components/icons/Triskele.svelte';
  import Eurosky from '$lib/components/icons/Eurosky.svelte';
  import Leaflet from '$lib/components/icons/Leaflet.svelte';
  import StandardSite from '$lib/components/icons/StandardSite.svelte';
  import MoonPhase from '$lib/components/icons/MoonPhase.svelte';
  import Imbolc from '$lib/components/icons/sabbats/Imbolc.svelte';
  import Ostara from '$lib/components/icons/sabbats/Ostara.svelte';
  import Beltane from '$lib/components/icons/sabbats/Beltane.svelte';
  import Litha from '$lib/components/icons/sabbats/Litha.svelte';
  import Lughnasadh from '$lib/components/icons/sabbats/Lughnasadh.svelte';
  import Mabon from '$lib/components/icons/sabbats/Mabon.svelte';
  import Samhain from '$lib/components/icons/sabbats/Samhain.svelte';
  import Yule from '$lib/components/icons/sabbats/Yule.svelte';
  import favicon from '$lib/assets/favicon.svg';
  import { Copy, Check } from '@lucide/svelte';
  import ColourDemonstrator from '$lib/components/ColourDemonstrator.svelte';
  import VerifierCard from '$lib/components/VerifierCard.svelte';
  import { getMoonPhaseName } from '$lib/utils/moonPhase';
  import { PUBLIC_ATPROTO_DID } from '$env/static/public';

  let { data } = $props();
  let copiedIndex = $state<string | null>(null);

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    copiedIndex = id;
    setTimeout(() => (copiedIndex = null), 2000);
  }

  const colorPalettes = [
    { name: 'Ink', prefix: 'ink', basePrefix: 'text', description: 'Text and foreground elements. Neutrals tinted toward the current primary hue.' },
    { name: 'Canvas', prefix: 'canvas', basePrefix: 'background', description: 'Backgrounds and surfaces. Subtle tint from the current primary hue.' },
    { name: 'Primary', prefix: 'primary', basePrefix: 'primary', description: 'Main brand hue. Interpolates through the Sabbat cycle.' },
    { name: 'Secondary', prefix: 'secondary', basePrefix: 'secondary', description: 'Complementary hue for visited states and secondary elements.' },
    { name: 'Accent', prefix: 'accent', basePrefix: 'accent', description: 'Vivid highlight hue for emphasis and inline markers.' },
  ];

  const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  const surfaces = [
    { token: '--surface-sunken', label: 'sunken' },
    { token: '--surface-color', label: 'base' },
    { token: '--surface-raised', label: 'raised' },
  ];

  const typeScale = [
    { token: '--text-xl', weight: 800, sample: 'Display heading' },
    { token: '--text-lg', weight: 700, sample: 'Section heading' },
    { token: '--text-md', weight: 400, sample: 'Body default' },
    { token: '--text-sm', weight: 400, sample: 'Labels and secondary copy' },
    { token: '--text-xs', weight: 400, sample: 'Captions and metadata' },
  ];

  const spacingScale = [
    { token: '--space-2xs', value: '2px', size: 2 },
    { token: '--space-xs', value: '4px', size: 4 },
    { token: '--space-sm', value: '8px', size: 8 },
    { token: '--space-3', value: '12px', size: 12 },
    { token: '--space-md', value: '16px', size: 16 },
    { token: '--space-6', value: '24px', size: 24 },
    { token: '--space-lg', value: '32px', size: 32 },
    { token: '--space-12', value: '48px', size: 48 },
    { token: '--space-xl', value: '64px', size: 64 },
    { token: '--space-2xl', value: '96px', size: 96 },
  ];

  const radiiScale = [
    { token: '--radius-xs', value: '4px', label: 'xs' },
    { token: '--radius-sm', value: '6px', label: 'sm' },
    { token: '--radius-md', value: '12px', label: 'md' },
    { token: '--radius-lg', value: '16px', label: 'lg' },
    { token: '--radius-xl', value: '24px', label: 'xl' },
    { token: '--radius-full', value: '9999px', label: 'full' },
  ];

  const durationScale = [
    { token: '--duration-instant', value: '100ms' },
    { token: '--duration-fast', value: '200ms' },
    { token: '--duration-normal', value: '300ms' },
    { token: '--duration-slow', value: '500ms' },
  ];

  const shells = [
    { name: 'Wide Shell', cls: '.shell-wide', width: '72rem', usage: 'Home, blog, about, projects, meta, brand' },
    { name: 'Prose Shell', cls: '.shell-prose', width: '72rem + TOC', usage: 'Blog posts' },
    { name: 'Narrow Shell', cls: '.shell-narrow', width: '48rem', usage: 'Subscriptions, support' },
  ];

  const sabbatsComponents = [
    { name: 'Imbolc', component: Imbolc },
    { name: 'Ostara', component: Ostara },
    { name: 'Beltane', component: Beltane },
    { name: 'Litha', component: Litha },
    { name: 'Lughnasadh', component: Lughnasadh },
    { name: 'Mabon', component: Mabon },
    { name: 'Samhain', component: Samhain },
    { name: 'Yule', component: Yule }
  ];

  const lunarCycle = Array.from({ length: 28 }, (_, index) => {
    const phase = index / 28;
    return {
      day: index + 1,
      phase,
      name: getMoonPhaseName(phase).name,
    };
  });

  const principles = [
    {
      name: 'Systematic colour',
      description:
        'OKLCH throughout — neutrals are tinted toward a dynamic brand hue that interpolates through the Sabbat cycle. No pure black or white. Every shade is derived and purposeful.',
    },
    {
      name: 'Purposeful spacing',
      description:
        'Every gap, padding, and margin derives from the 4pt scale with semantic token names. No magic numbers anywhere in the codebase.',
    },
    {
      name: 'Typography as hierarchy',
      description:
        'Strict 1.25 modular scale with fluid clamp() sizing. Narrow columns — 65–75ch — and line-height that scales inversely with size.',
    },
    {
      name: 'Functional interactivity',
      description:
        'Actionable editorial rows share the same primary-tinted hover and keyboard-focus state. Motion is brief, communicates state, and is removed when reduced motion is preferred.',
    },
    {
      name: 'Anti-slop',
      description:
        'Absolute ban on AI-typical patterns — no side-stripe borders, no gradient text, no hollow card aesthetics, no generic colour choices.',
    },
  ];

  const proseElements = [
    { tag: 'Paragraphs', desc: 'Default text flow, 1.75 line-height.' },
    { tag: 'Headings', desc: '1.25 modular scale, -0.025em tracking.' },
    { tag: 'Links', desc: 'Primary color, underlined with 35% opacity mix.' },
    { tag: 'Code', desc: 'JetBrains Mono, accent-600 color, raised background.' },
    { tag: 'Blockquote', desc: 'Primary-500 left border, italicized text.' },
    { tag: 'Tables', desc: 'GFM style, responsive overflow, alternating row hover.' },
  ];

  const voiceGuidelines = [
    {
      attribute: 'Technical',
      do: 'Use precise terminology, cite sources, and explain technical trade-offs.',
      dont: 'Use marketing fluff, "revolutionary" buzzwords, or hand-wavy generalizations.',
    },
    {
      attribute: 'Personal',
      do: 'Write from a first-person perspective, share personal findings, and admit uncertainty.',
      dont: 'Use the corporate "we" or attempt to sound like an authoritative institution.',
    },
    {
      attribute: 'Exploratory',
      do: 'Document experiments (even failed ones) and ask open-ended questions.',
      dont: 'Present every project as a finished, perfect product.',
    },
  ];

  const assets = {
    favicon: {
      path: favicon,
      publicUrl: '/favicon.svg',
      size: '32×32',
      format: 'SVG',
      usage: 'Browser tab, bookmarks, shortcuts',
    },
    ogImage: {
      endpoint: '/api/og/generate',
      size: '1200×630',
      format: 'PNG (dynamic)',
      params: ['title', 'subtitle', 'type', 'slug'],
      usage: 'Open Graph, Twitter cards',
    },
  };

  const ogColours = [
    { token: 'bg', value: '#1a201c', desc: 'ink-950 dark' },
    { token: 'surface', value: '#222a26', desc: 'surface-raised' },
    { token: 'border', value: '#3a4643', desc: 'surface-color' },
    { token: 'primary', value: '#a6e3a1', desc: 'primary-500' },
    { token: 'text', value: '#d9e4de', desc: 'ink-50' },
    { token: 'textMuted', value: '#a0b0a8', desc: 'ink-500' },
  ];

  const ogPreviews = [
    { title: 'Design', type: 'DESIGN', desc: 'Technical specification', slug: '/site/design' },
    { title: 'About Ewan Croft', type: 'ABOUT', desc: 'Identity, work, and presence on the open web', slug: '/about' },
    { title: 'The Pentacle and the Triskele', type: 'ARTICLE', desc: 'Notes on two symbols used throughout the website', slug: '/blog/pentacle-and-triskele' },
    { title: 'Selected Projects', type: 'PROJECTS', desc: 'Open-source software and experiments', slug: '/projects' },
  ].map((preview) => ({
    ...preview,
    url: `/api/og/generate?${new URLSearchParams({
      title: preview.title,
      subtitle: preview.desc,
      type: preview.type,
      slug: preview.slug,
    })}`,
  }));
</script>

<SiteHead
  title="Design"
  description="The full design language, asset reference, and component primitives for ewancroft.uk."
  ogSubtitle="Design system and brand kit."
  ogType="DESIGN"
/>

<main class="shell-wide design-page">
  <header class="page-hd spec-header">
    <div class="spec-meta">
      <span class="meta-tag">DESIGN SYSTEM</span>
      <span class="meta-tag">v12.2.0</span>
      <span class="meta-tag">TECHNICAL SPEC</span>
    </div>
    <h1 class="page-title">Identity &amp; Assets</h1>
    <p class="spec-abstract">
      A comprehensive reference of the design primitives, assets, and core principles governing the visual identity of <strong>ewancroft.uk</strong>. Derived from physical precision and technical integrity.
    </p>
  </header>

  <div class="spec-grid">
    <nav class="spec-toc">
      <TableOfContents container=".spec-content" selector="h2" />
    </nav>

    <div class="spec-content">
      <!-- Identity -->
      <section class="spec-section identity" id="identity">
        <header class="section-hd">
          <h2 class="section-title">Identity</h2>
        </header>
        <div class="section-content">
          <div class="id-card">
            <div class="id-header">SYSTEM IDENTIFICATION</div>
            <div class="id-body">
              <dl class="id-fields">
                <div>
                  <dt>DOMAIN</dt>
                  <dd>ewancroft.uk</dd>
                </div>
                <div>
                  <dt>TAGLINE</dt>
                  <dd>Anglo-Scottish pagan, poet, and programmer.</dd>
                </div>
                <div>
                  <dt>PERSONALITY</dt>
                  <dd>Technical · Personal · Exploratory</dd>
                </div>
                <div>
                  <dt>AESTHETIC</dt>
                  <dd>Minimalist, systematic, typography-led</dd>
                </div>
                <div>
                  <dt>PRIMARY LOGO</dt>
                  <dd>
                    <div class="logo-sample">
                      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="16" fill="var(--color-primary-500)"/>
                        <path d="M11 21V11H21V13H13V15H19V17H13V19H21V21H11Z" fill="var(--color-canvas-50)"/>
                      </svg>
                      <span>Favicon Primary</span>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <!-- Colour -->
      <section class="spec-section colour" id="colour">
        <header class="section-hd">
          <h2 class="section-title">Colour Architecture</h2>
        </header>
        <div class="section-content">
          <p class="section-intro">
            Derived from dynamic brand OKLCH hues that interpolate between Sabbat base points throughout the year.
            Neutrals are tinted toward the current brand hue (Chroma 0.005–0.012).
            Implementation via <code>light-dark()</code> ensures seamless theme transitions based on user OS preference.
          </p>

          <div class="palette-stacks">
            {#each colorPalettes as palette}
              <div class="palette-stack">
                <div class="palette-info">
                  <h3 class="stack-name" id="palette-{palette.name.toLowerCase()}">{palette.name}</h3>
                  <code class="stack-prefix">--color-{palette.prefix}-*</code>
                </div>
                <div class="swatch-grid">
                  {#each colorSteps as step}
                    <div class="swatch-item">
                      <div
                        class="swatch"
                        style="background: var(--{palette.basePrefix}-{step});"
                        title="--color-{palette.prefix}-{step}"
                      ></div>
                      <span class="swatch-val">{step}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>

          <h3 class="sub-title" id="colour-demonstrator">Colour Demonstrator</h3>
          <ColourDemonstrator />

          <div class="spec-sub-section surfaces">
            <h3 class="sub-title" id="semantic-surfaces">Semantic Surfaces</h3>
            <div class="surface-grid">
              {#each surfaces as s}
                <div class="surface-card">
                  <div class="surface-preview" style="background: var({s.token});"></div>
                  <div class="surface-meta">
                    <span class="surface-label">{s.label}</span>
                    <code class="surface-token">{s.token}</code>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </section>

      <!-- Typography -->
      <section class="spec-section typography" id="typography">
        <header class="section-hd">
          <h2 class="section-title">Typography</h2>
        </header>
        <div class="section-content">
          <p class="section-intro">
            Variable Inter for all prose; JetBrains Mono for technical strings. Modular scale at ratio 1.25,
            fluid via <code>clamp()</code>.
          </p>

          <div class="type-specimen">
            <div class="font-primary">
              <span class="font-meta">SANS / INTER VARIABLE / 400-800</span>
              <div class="font-display">AaBbCcDdEeFfGg</div>
            </div>
            <div class="font-mono">
              <span class="font-meta">MONO / JETBRAINS MONO / 400</span>
              <div class="font-display">0123456789!?@#</div>
            </div>
          </div>

          <div class="scale-table">
            <div class="table-hd">
              <span>TOKEN</span>
              <span>SAMPLE</span>
              <span class="hide-mobile">WEIGHT</span>
              <span></span>
            </div>
            {#each typeScale as step}
              <div class="table-row">
                <code class="table-token">{step.token}</code>
                <div class="table-sample" style="font-size: var({step.token}); font-weight: {step.weight};">
                  {step.sample}
                </div>
                <span class="table-weight hide-mobile">{step.weight}</span>
                <button
                  type="button"
                  class="copy-btn copy-btn--compact"
                  aria-label="Copy token {step.token}"
                  onclick={() => copyCode(step.token, step.token)}
                >
                  {#if copiedIndex === step.token}
                    <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                  {:else}
                    <Copy size={12} strokeWidth={2} aria-hidden="true" />
                  {/if}
                </button>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- Prose -->
      <section class="spec-section prose-spec" id="prose">
        <header class="section-hd">
          <h2 class="section-title">Prose Styling</h2>
        </header>
        <div class="section-content">
          <p class="section-intro">
            Scoped under <code>.prose</code> for blog content. All elements are design-token compliant and rely on semantic hierarchy.
          </p>
          <div class="prose-grid">
            {#each proseElements as el}
              <div class="prose-card">
                <span class="prose-tag">{el.tag}</span>
                <p>{el.desc}</p>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- Geometry -->
      <section class="spec-section geometry" id="geometry">
        <header class="section-hd">
          <h2 class="section-title">Geometry</h2>
        </header>
        <div class="section-content">
          <div class="geo-grid">
            <div class="geo-panel">
              <h3 class="sub-title" id="spacing-scale">Spacing Scale</h3>
              <div class="spacing-map">
                {#each spacingScale as step}
                  <div class="spacing-entry">
                    <code class="token">{step.token}</code>
                    <div class="bar-wrap">
                      <div class="bar" style="width: {step.size}px;"></div>
                    </div>
                    <span class="value">{step.value}</span>
                  </div>
                {/each}
              </div>
            </div>

            <div class="geo-panel">
              <h3 class="sub-title" id="corner-radii">Corner Radii</h3>
              <div class="radii-map">
                {#each radiiScale as r}
                  <div class="radius-entry">
                    <div class="radius-box" style="border-radius: var({r.token});"></div>
                    <code class="token">{r.token}</code>
                    <span class="value">{r.value}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Motion -->
      <section class="spec-section motion" id="motion">
        <header class="section-hd">
          <h2 class="section-title">Motion</h2>
        </header>
        <div class="section-content">
          <div class="motion-layout">
            <div class="motion-tokens">
              <h3 class="sub-title" id="duration">Duration</h3>
              {#each durationScale as d}
                <div class="token-item">
                  <code class="name">{d.token}</code>
                  <span class="val">{d.value}</span>
                </div>
              {/each}
            </div>
            <div class="motion-tokens">
              <h3 class="sub-title" id="easing">Easing</h3>
              <div class="token-item">
                <code class="name">--ease-out-quart</code>
                <span class="val">bezier(0.25, 1, 0.5, 1)</span>
              </div>
              <div class="token-item">
                <code class="name">--ease-out-expo</code>
                <span class="val">bezier(0.16, 1, 0.3, 1)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Iconography -->
      <section class="spec-section iconography" id="iconography">
        <header class="section-hd">
          <h2 class="section-title">Iconography</h2>
        </header>
        <div class="section-content">
          <p class="section-intro">System icons are implemented as SVG components (16px, <code>currentColor</code>). Pagan, seasonal, and lunar symbols use <code>currentColor</code> for stroke or fill, keeping them consistent across themes.</p>
          
          <h3 class="sub-title" id="iconography-system">System Icons</h3>
          <div class="icon-grid">
            <div class="icon-card"><div class="icon-preview"><Bluesky size={32} /></div><code class="icon-name">Bluesky</code></div>
            <div class="icon-card"><div class="icon-preview"><Eurosky size={32} /></div><code class="icon-name">Eurosky</code></div>
            <div class="icon-card"><div class="icon-preview"><Leaflet size={32} /></div><code class="icon-name">Leaflet</code></div>
            <div class="icon-card"><div class="icon-preview"><StandardSite size={32} /></div><code class="icon-name">StandardSite</code></div>
          </div>

          <h3 class="sub-title" id="iconography-pagan">Pagan Symbols</h3>
          <div class="icon-grid">
            <div class="icon-card"><div class="icon-preview"><Pentacle size={32} /></div><code class="icon-name">Pentacle</code></div>
            <div class="icon-card"><div class="icon-preview"><Triskele size={32} /></div><code class="icon-name">Triskele</code></div>
          </div>

          <h3 class="sub-title" id="iconography-lunar">Lunar Phases</h3>
          <p class="component-note">A continuous SVG terminator sampled here across a 28-day visual cycle. The footer renders the live astronomical phase and pairs it with the nearest conventional phase name.</p>
          <div class="lunar-cycle-grid">
            {#each lunarCycle as step}
              <div class="lunar-phase-sample" title="Day {step.day}: {step.name}">
                <div class="icon-preview"><MoonPhase phase={step.phase} size={28} /></div>
                <code class="icon-name">{String(step.day).padStart(2, '0')}</code>
              </div>
            {/each}
          </div>

          <h3 class="sub-title" id="iconography-wheel">Wheel of the Year</h3>
          <div class="icon-grid">
            <div class="icon-card"><div class="icon-preview"><Imbolc size={48} strokeWidth={1.5} /></div><code class="icon-name">Imbolc</code></div>
            <div class="icon-card"><div class="icon-preview"><Ostara size={48} strokeWidth={1.5} /></div><code class="icon-name">Ostara</code></div>
            <div class="icon-card"><div class="icon-preview"><Beltane size={48} strokeWidth={1.5} /></div><code class="icon-name">Beltane</code></div>
            <div class="icon-card"><div class="icon-preview"><Litha size={48} strokeWidth={1.5} /></div><code class="icon-name">Litha</code></div>
            <div class="icon-card"><div class="icon-preview"><Lughnasadh size={48} strokeWidth={1.5} /></div><code class="icon-name">Lughnasadh</code></div>
            <div class="icon-card"><div class="icon-preview"><Mabon size={48} strokeWidth={1.5} /></div><code class="icon-name">Mabon</code></div>
            <div class="icon-card"><div class="icon-preview"><Samhain size={48} strokeWidth={1.5} /></div><code class="icon-name">Samhain</code></div>
            <div class="icon-card"><div class="icon-preview"><Yule size={48} strokeWidth={1.5} /></div><code class="icon-name">Yule</code></div>
          </div>
        </div>
      </section>

      <!-- Components -->
      <section class="spec-section components" id="components">
        <header class="section-hd">
          <h2 class="section-title">Components</h2>
        </header>
        <div class="section-content">
          <div class="component-demo-stack">
            <div class="comp-item">
              <h3 class="sub-title" id="verifier-card-demo">Verifier Card (Live Profile Data and image fallback example)</h3>
              <VerifierCard 
                did={data.profile.did}
                name={data.profile.displayName ?? data.profile.handle}
                handle={data.profile.handle}
                date="2026-06-15"
              />
            </div>

            <div class="comp-item">
              <h3 class="sub-title" id="panel-primitive">Panel Primitive</h3>
              <div class="panel">
                <div class="panel-head">panel.component</div>
                <div class="panel-body">
                  <p>Standard container for technical information and data displays.</p>
                </div>
              </div>
            </div>

            <div class="comp-item">
              <h3 class="sub-title" id="editorial-index">Editorial Index</h3>
              <p class="component-note">
                The default collection pattern for projects, posts, profiles, links, support options, and site metadata. A raised parent surface groups compact inset rows; only actionable rows receive the shared hover and keyboard-focus treatment.
              </p>
              <div class="editorial-demo">
                <div class="editorial-demo-meta">
                  <span class="meta-tag">DEFAULT UI LIST</span>
                  <code>.project-grid / .post-list / .meta-list</code>
                </div>
                <div class="project-grid editorial-demo-list">
                  <a href="#editorial-index" class="project-card project-card--link">
                    <strong class="project-name">Interactive row</strong>
                    <p class="project-desc">Primary-tinted hover and keyboard-focus state.</p>
                    <span class="project-card-meta"><span class="project-language">LINK</span></span>
                  </a>
                  <div class="project-card">
                    <strong class="project-name">Static row</strong>
                    <p class="project-desc">No highlight when the row has no action.</p>
                    <span class="project-card-meta"><span class="project-language">DATA</span></span>
                  </div>
                </div>
                <dl class="editorial-anatomy">
                  <div>
                    <dt>Container</dt>
                    <dd><code>--surface-raised</code> with a <code>--space-xs</code> inset</dd>
                  </div>
                  <div>
                    <dt>Row</dt>
                    <dd><code>--space-3</code> padding and <code>--radius-sm</code> corners</dd>
                  </div>
                  <div>
                    <dt>Highlight</dt>
                    <dd>12% primary mixed into the sunken surface</dd>
                  </div>
                  <div>
                    <dt>Motion</dt>
                    <dd>No positional movement; state changes use colour only</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div class="comp-item">
              <h3 class="sub-title" id="interactive-elements">Interactive Elements</h3>
              <div class="interactive-demo">
                <div class="demo-col">
                  <span class="demo-label">Text Link</span>
                  <a href="#components">Interactive Link</a>
                </div>
                <div class="demo-col">
                  <span class="demo-label">Primary Button</span>
                  <button type="button">Action Trigger</button>
                </div>
                <div class="demo-col">
                  <span class="demo-label">Inline Semantics</span>
                  <div>
                    <code>code-snippet</code>
                    <mark>highlight</mark>
                  </div>
                </div>
              </div>
            </div>

            <div class="comp-item">
              <h3 class="sub-title" id="blockquote">Blockquote</h3>
              <blockquote>
                "Every element must earn its place on the screen. If it doesn't serve a functional purpose, it is slop."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <!-- Layout -->
      <section class="spec-section layout" id="layout">
        <header class="section-hd">
          <h2 class="section-title">Layout Systems</h2>
        </header>
        <div class="section-content">
          <p class="section-intro">
            Three standardized shells constrain content width and manage vertical rhythm. All layouts are responsive and adapt to container widths.
          </p>
          <div class="shell-stack">
            {#each shells as shell}
              <div class="shell-viz-row">
                <div class="shell-info">
                  <span class="shell-name">{shell.name}</span>
                  <code class="shell-token">{shell.cls}</code>
                </div>
                <div class="shell-bar-wrap">
                  <div class="shell-bar" style="width: calc({shell.width.includes('+') ? '80%' : (parseInt(shell.width) / 100 * 100) + '%'});">
                    <span class="shell-val">{shell.width}</span>
                  </div>
                </div>
                <p class="shell-usage-note">{shell.usage}</p>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- Voice & Tone -->
      <section class="spec-section voice" id="voice">
        <header class="section-hd">
          <h2 class="section-title">Voice &amp; Tone</h2>
        </header>
        <div class="section-content">
          <div class="voice-grid">
            {#each voiceGuidelines as g}
              <div class="voice-card">
                <h3 class="voice-attr" id="voice-{g.attribute.toLowerCase()}">{g.attribute}</h3>
                <div class="voice-rules">
                  <div class="rule do">
                    <span class="rule-label">DO</span>
                    <p>{g.do}</p>
                  </div>
                  <div class="rule dont">
                    <span class="rule-label">DON'T</span>
                    <p>{g.dont}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- Manifesto -->
      <section class="spec-section principles" id="manifesto">
        <header class="section-hd">
          <h2 class="section-title">Manifesto</h2>
        </header>
        <div class="section-content">
          <div class="manifesto-list">
            {#each principles as p}
              <article class="principle-card">
                <div class="p-body">
                  <h3 class="p-name">{p.name}</h3>
                  <p class="p-desc">{p.description}</p>
                </div>
              </article>
            {/each}
          </div>
        </div>
      </section>

      <!-- Assets -->
      <section class="spec-section assets" id="assets">
        <header class="section-hd">
          <h2 class="section-title">Assets</h2>
        </header>
        <div class="section-content">
          <p class="section-intro">
            Core brand assets and dynamic generation endpoints.
          </p>

          <div class="asset-grid">
            <div class="asset-card">
              <h3 class="sub-title" id="favicon">Favicon</h3>
              <dl class="asset-meta">
                <div><dt>PATH</dt><dd><code>{assets.favicon.publicUrl}</code></dd></div>
                <div><dt>SIZE</dt><dd>{assets.favicon.size}</dd></div>
                <div><dt>FORMAT</dt><dd>{assets.favicon.format}</dd></div>
              </dl>
            </div>

            <div class="asset-card og-card">
              <h3 class="sub-title" id="open-graph">Open Graph (Dynamic)</h3>
              <p class="section-intro">These are final 1200×630 PNGs rendered by the production endpoint. They use the current seasonal palette, continuous lunar phase, and pentacle mark.</p>
              <div class="og-render-grid">
                {#each ogPreviews as preview}
                  <figure class="og-render">
                    <a href={preview.url} target="_blank" rel="noopener" aria-label="Open full-size {preview.title} OpenGraph image">
                      <img
                        src={preview.url}
                        alt="OpenGraph preview for {preview.title}"
                        width="1200"
                        height="630"
                        loading="lazy"
                        class="og-img"
                      />
                    </a>
                    <figcaption>
                      <strong>{preview.title}</strong>
                      <code>{preview.type}</code>
                    </figcaption>
                  </figure>
                {/each}
              </div>
              <div class="og-info-grid">
                <dl class="asset-meta">
                  <div><dt>ENDPOINT</dt><dd><code>{assets.ogImage.endpoint}</code></dd></div>
                  <div><dt>SIZE</dt><dd>{assets.ogImage.size}</dd></div>
                  <div><dt>FORMAT</dt><dd>{assets.ogImage.format}</dd></div>
                </dl>
                <div>
                  <span class="meta-label">SEASONAL PALETTE</span>
                  <div class="og-swatches">
                    {#each ogColours as colour}
                      <span class="og-swatch" style:background={colour.value} title="{colour.token}: {colour.desc}"></span>
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</main>
