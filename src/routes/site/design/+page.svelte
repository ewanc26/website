<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';
  import TableOfContents from '$lib/components/TableOfContents.svelte';
  import Bluesky from '$lib/components/icons/Bluesky.svelte';
  import Pentacle from '$lib/components/icons/Pentacle.svelte';
  import Triskele from '$lib/components/icons/Triskele.svelte';
  import Eurosky from '$lib/components/icons/Eurosky.svelte';
  import Leaflet from '$lib/components/icons/Leaflet.svelte';
  import StandardSite from '$lib/components/icons/StandardSite.svelte';
  import favicon from '$lib/assets/favicon.svg';
  import { Copy, Check } from '@lucide/svelte';

  let copiedIndex = $state<string | null>(null);

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    copiedIndex = id;
    setTimeout(() => (copiedIndex = null), 2000);
  }

  const colorPalettes = [
    {
      name: 'Ink',
      prefix: 'ink',
      description: 'Text and foreground elements. Green-tinted neutrals at 150°.',
    },
    {
      name: 'Canvas',
      prefix: 'canvas',
      description: 'Backgrounds and surfaces. Green-tinted at 150°.',
    },
    {
      name: 'Primary',
      prefix: 'primary',
      description: 'Brand green. Interactive elements and links. 150°.',
    },
    {
      name: 'Secondary',
      prefix: 'secondary',
      description: 'Muted green for visited states and secondary accents. 140°.',
    },
    {
      name: 'Accent',
      prefix: 'accent',
      description: 'Vivid green for highlights and inline code. 160°.',
    },
  ];

  const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  const surfaces = [
    { token: '--surface-sunken', label: 'sunken', alias: '--color-canvas-50' },
    { token: '--surface-color', label: 'base', alias: '--color-canvas-200' },
    { token: '--surface-raised', label: 'raised', alias: '--color-canvas-100' },
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

  const principles = [
    {
      number: '01',
      name: 'Systematic colour',
      description:
        'OKLCH throughout — brand-hue-tinted neutrals (140–160°), no pure black or white, no AI-standard palettes. Every shade is derived and purposeful.',
    },
    {
      number: '02',
      name: 'Purposeful spacing',
      description:
        'Every gap, padding, and margin derives from the 4pt scale with semantic token names. No magic numbers anywhere in the codebase.',
    },
    {
      number: '03',
      name: 'Typography as hierarchy',
      description:
        'Strict 1.25 modular scale with fluid clamp() sizing. Narrow columns — 65–75ch — and line-height that scales inversely with size.',
    },
    {
      number: '04',
      name: 'Functional interactivity',
      description:
        'Motion reserved for state changes only. Transitions are brief and purposeful — never decorative. Respects prefers-reduced-motion.',
    },
    {
      number: '05',
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
      endpoint: '/og/generate',
      size: '1200×630',
      format: 'SVG (dynamic)',
      params: ['title', 'type'],
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
    { title: 'Design', type: 'DESIGN', desc: 'Technical Spec' },
    { title: 'About', type: 'ABOUT', desc: 'Profile' },
    { title: 'The Pentacle and the Triskele', type: 'BLOG', desc: 'Blog Post' },
    { title: 'Projects', type: 'PROJECTS', desc: 'Projects Index' },
  ];
</script>

<SiteHead
  title="Design"
  description="The full design language, asset reference, and component primitives for ewancroft.uk."
  ogType="DESIGN"
/>

<main class="shell-wide">
  <header class="page-hd spec-header">
    <div class="spec-meta">
      <span class="meta-tag">DESIGN SYSTEM</span>
      <span class="meta-tag">v12.1.0</span>
      <span class="meta-tag">TECHNICAL SPEC</span>
    </div>
    <h1 class="page-title">Identity & Assets</h1>
    <p class="spec-abstract">
      A comprehensive reference of the design primitives, assets, and core principles governing the visual identity of <strong>ewancroft.uk</strong>. Derived from physical precision and technical integrity.
    </p>
  </header>

  <div class="spec-grid">
    <nav class="spec-toc">
      <TableOfContents container=".spec-content" />
    </nav>

    <div class="spec-content">
      <!-- ── [01] Identity ───────────────────────────── -->
      <section class="spec-section identity" id="identity">
        <header class="section-hd">
          <span class="section-num">[01]</span>
          <h2 class="section-title" id="identity">Identity</h2>
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

      <!-- ── [02] Colour ─────────────────────────────── -->
      <section class="spec-section colour" id="colour">
        <header class="section-hd">
          <span class="section-num">[02]</span>
          <h2 class="section-title" id="colour">Colour Architecture</h2>
        </header>
        <div class="section-content">
          <p class="section-intro">
            Derived from brand OKLCH hues (140–160°). Neutrals are tinted toward the brand hue (Chroma 0.005–0.01). 
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
                        style="background: var(--color-{palette.prefix}-{step});"
                        title="--color-{palette.prefix}-{step}"
                      ></div>
                      <span class="swatch-val">{step}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>

          <div class="spec-sub-section surfaces" style="margin-top: var(--space-lg);">
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

      <!-- ── [03] Typography ─────────────────────────── -->
      <section class="spec-section typography" id="typography">
        <header class="section-hd">
          <span class="section-num">[03]</span>
          <h2 class="section-title" id="typography">Typography</h2>
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

      <!-- ── [04] Prose ──────────────────────────────── -->
      <section class="spec-section prose-spec" id="prose">
        <header class="section-hd">
          <span class="section-num">[04]</span>
          <h2 class="section-title" id="prose">Prose Styling</h2>
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

      <!-- ── [05] Geometry ───────────────────────────── -->
      <section class="spec-section geometry" id="geometry">
        <header class="section-hd">
          <span class="section-num">[05]</span>
          <h2 class="section-title" id="geometry">Geometry</h2>
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

      <!-- ── [06] Motion ─────────────────────────────── -->
      <section class="spec-section motion" id="motion">
        <header class="section-hd">
          <span class="section-num">[06]</span>
          <h2 class="section-title" id="motion">Motion</h2>
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

      <!-- ── [07] Iconography ────────────────────────── -->
      <section class="spec-section iconography" id="iconography">
        <header class="section-hd">
          <span class="section-num">[07]</span>
          <h2 class="section-title" id="iconography">Iconography</h2>
        </header>
        <div class="section-content">
          <p class="section-intro">
            System icons are implemented as SVG components with a default size of 16px. They inherit <code>currentColor</code> for seamless integration. Pagan symbols use <code>currentColor</code> for stroke (pentacle) or fill (triskele).
          </p>
          <div class="icon-grid">
            <div class="icon-card">
              <div class="icon-preview">
                <Bluesky size={32} />
              </div>
              <code class="icon-name">Bluesky.svelte</code>
            </div>
            <div class="icon-card">
              <div class="icon-preview">
                <Eurosky size={32} />
              </div>
              <code class="icon-name">Eurosky.svelte</code>
            </div>
            <div class="icon-card">
              <div class="icon-preview">
                <Leaflet size={32} />
              </div>
              <code class="icon-name">Leaflet.svelte</code>
            </div>
            <div class="icon-card">
              <div class="icon-preview">
                <StandardSite size={32} />
              </div>
              <code class="icon-name">StandardSite.svelte</code>
            </div>
            <div class="icon-card">
              <div class="icon-preview">
                <Pentacle size={32} />
              </div>
              <code class="icon-name">Pentacle.svelte</code>
            </div>
            <div class="icon-card">
              <div class="icon-preview">
                <Triskele size={32} />
              </div>
              <code class="icon-name">Triskele.svelte</code>
            </div>
          </div>
        </div>
      </section>

      <!-- ── [08] Components ─────────────────────────── -->
      <section class="spec-section components" id="components">
        <header class="section-hd">
          <span class="section-num">[08]</span>
          <h2 class="section-title" id="components">Components</h2>
        </header>
        <div class="section-content">
          <div class="component-demo-stack">
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

      <!-- ── [09] Layout ─────────────────────────────── -->
      <section class="spec-section layout" id="layout">
        <header class="section-hd">
          <span class="section-num">[09]</span>
          <h2 class="section-title" id="layout">Layout Systems</h2>
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

      <!-- ── [10] Voice & Tone ───────────────────────── -->
      <section class="spec-section voice" id="voice">
        <header class="section-hd">
          <span class="section-num">[10]</span>
          <h2 class="section-title" id="voice">Voice & Tone</h2>
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
      <!-- ── [11] Manifesto ──────────────────────────── -->
      <section class="spec-section principles" id="manifesto">
        <header class="section-hd">
          <span class="section-num">[11]</span>
          <h2 class="section-title" id="manifesto">Manifesto</h2>
        </header>
        <div class="section-content">
          <div class="manifesto-list">
            {#each principles as p}
              <article class="principle-card">
                <span class="p-num">{p.number}</span>
                <div class="p-body">
                  <h3 class="p-name" id="principle-{p.number}">{p.name}</h3>
                  <p class="p-desc">{p.description}</p>
                </div>
              </article>
            {/each}
          </div>
        </div>
      </section>

      <!-- ── [12] Assets ─────────────────────────────── -->
      <section class="spec-section assets" id="assets">
        <header class="section-hd">
          <span class="section-num">[12]</span>
          <h2 class="section-title" id="assets">Assets</h2>
        </header>
        <div class="section-content">
          <p class="section-intro">
            Core brand assets and dynamic generation endpoints.
          </p>

          <div class="asset-grid">
            <div class="asset-card">
              <h3 class="sub-title" id="favicon">Favicon</h3>
              <div class="asset-preview favicon-preview">
                <img src={assets.favicon.path} alt="Favicon" width="32" height="32" />
              </div>
              <dl class="asset-meta">
                <div><dt>PATH</dt><dd><code>{assets.favicon.publicUrl}</code></dd></div>
                <div><dt>SIZE</dt><dd>{assets.favicon.size}</dd></div>
                <div><dt>FORMAT</dt><dd>{assets.favicon.format}</dd></div>
              </dl>
            </div>

            <div class="asset-card og-card">
              <h3 class="sub-title" id="open-graph">Open Graph (Dynamic)</h3>
              <div class="og-info-grid">
                <div class="og-previews">
                  {#each ogPreviews as preview}
                    <div style="margin-bottom: 1rem;">
                      <span class="meta-label">{preview.desc}</span>
                      <div class="asset-preview og-preview">
                        <img
                          src="{assets.ogImage.endpoint}?title={encodeURIComponent(preview.title)}&type={encodeURIComponent(preview.type)}&subtitle={encodeURIComponent(preview.desc)}"
                          alt="OG Image: {preview.desc}"
                          class="og-img"
                        />
                      </div>
                    </div>
                  {/each}
                </div>
                <div class="og-colours">
                  <span class="meta-label">OG COLOUR PALETTE</span>
                  <div class="og-swatches">
                    {#each ogColours as c}
                      <div class="og-swatch" style="background: {c.value};" title="{c.token}: {c.value} ({c.desc})"></div>
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
