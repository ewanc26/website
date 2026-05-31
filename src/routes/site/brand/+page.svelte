<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';
  import Bluesky from '$lib/components/icons/Bluesky.svelte';
  import Pentacle from '$lib/components/icons/Pentacle.svelte';
  import Triskele from '$lib/components/icons/Triskele.svelte';

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
</script>

<SiteHead
  title="Brand Kit"
  description="The full brand language, asset reference, and component primitives for ewancroft.uk."
/>

<main class="shell-wide spec-sheet">
  <!-- ── Spec Header ──────────────────────────────── -->
  <header class="spec-header">
    <div class="spec-meta">
      <span class="meta-tag">FULL BRAND KIT</span>
      <span class="meta-tag">v2.1.0</span>
      <span class="meta-tag">TECHNICAL SPEC</span>
    </div>
    <div class="header-main">
      <h1 class="spec-title">Identity & Assets</h1>
      <p class="spec-abstract">
        A comprehensive reference of the design primitives, assets, and core principles governing the visual identity of <strong>ewancroft.uk</strong>. Derived from physical precision and technical integrity.
      </p>
    </div>
  </header>

  <nav class="spec-toc">
    <ul class="toc-list">
      <li><a href="#identity">01 Identity</a></li>
      <li><a href="#colour">02 Colour</a></li>
      <li><a href="#typography">03 Typography</a></li>
      <li><a href="#geometry">04 Geometry</a></li>
      <li><a href="#motion">05 Motion</a></li>
      <li><a href="#iconography">06 Iconography</a></li>
      <li><a href="#components">07 Components</a></li>
      <li><a href="#layout">08 Layout</a></li>
      <li><a href="#voice">09 Voice & Tone</a></li>
      <li><a href="#manifesto">10 Manifesto</a></li>
    </ul>
  </nav>

  <div class="spec-grid">
    <!-- ── [01] Identity ───────────────────────────── -->
    <section class="spec-section identity" id="identity">
      <header class="section-hd">
        <span class="section-num">[01]</span>
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

    <!-- ── [02] Colour ─────────────────────────────── -->
    <section class="spec-section colour" id="colour">
      <header class="section-hd">
        <span class="section-num">[02]</span>
        <h2 class="section-title">Colour Architecture</h2>
      </header>
      <div class="section-content">
        <p class="section-intro">
          Derived from brand OKLCH hues (140–160°). Neutrals are tinted toward the brand hue (Chroma 0.005–0.01). 
          Implementation via <code>light-dark()</code> ensures seamless theme transitions.
        </p>

        <div class="palette-stacks">
          {#each colorPalettes as palette}
            <div class="palette-stack">
              <div class="palette-info">
                <h3 class="stack-name">{palette.name}</h3>
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

        <div class="spec-sub-section surfaces">
          <h3 class="sub-title">Semantic Surfaces</h3>
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
          </div>
          {#each typeScale as step}
            <div class="table-row">
              <code class="table-token">{step.token}</code>
              <div class="table-sample" style="font-size: var({step.token}); font-weight: {step.weight};">
                {step.sample}
              </div>
              <span class="table-weight hide-mobile">{step.weight}</span>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- ── [04] Geometry ───────────────────────────── -->
    <section class="spec-section geometry" id="geometry">
      <header class="section-hd">
        <span class="section-num">[04]</span>
        <h2 class="section-title">Geometry</h2>
      </header>
      <div class="section-content">
        <div class="geo-grid">
          <div class="geo-panel">
            <h3 class="sub-title">Spacing Scale</h3>
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
            <h3 class="sub-title">Corner Radii</h3>
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

    <!-- ── [05] Motion ─────────────────────────────── -->
    <section class="spec-section motion" id="motion">
      <header class="section-hd">
        <span class="section-num">[05]</span>
        <h2 class="section-title">Motion</h2>
      </header>
      <div class="section-content">
        <div class="motion-layout">
          <div class="motion-tokens">
            <h3 class="sub-title">Duration</h3>
            {#each durationScale as d}
              <div class="token-item">
                <code class="name">{d.token}</code>
                <span class="val">{d.value}</span>
              </div>
            {/each}
          </div>
          <div class="motion-tokens">
            <h3 class="sub-title">Easing</h3>
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

    <!-- ── [06] Iconography ────────────────────────── -->
    <section class="spec-section iconography" id="iconography">
      <header class="section-hd">
        <span class="section-num">[06]</span>
        <h2 class="section-title">Iconography</h2>
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

    <!-- ── [07] Components ─────────────────────────── -->
    <section class="spec-section components" id="components">
      <header class="section-hd">
        <span class="section-num">[07]</span>
        <h2 class="section-title">Components</h2>
      </header>
      <div class="section-content">
        <div class="component-demo-stack">
          <div class="comp-item">
            <h3 class="sub-title">Panel Primitive</h3>
            <div class="panel">
              <div class="panel-head">panel.component</div>
              <div class="panel-body">
                <p>Standard container for technical information and data displays.</p>
              </div>
            </div>
          </div>

          <div class="comp-item">
            <h3 class="sub-title">Interactive Elements</h3>
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
            <h3 class="sub-title">Blockquote</h3>
            <blockquote>
              "Every element must earn its place on the screen. If it doesn't serve a functional purpose, it is slop."
            </blockquote>
          </div>
        </div>
      </div>
    </section>

    <!-- ── [08] Layout ─────────────────────────────── -->
    <section class="spec-section layout" id="layout">
      <header class="section-hd">
        <span class="section-num">[08]</span>
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

    <!-- ── [09] Voice & Tone ───────────────────────── -->
    <section class="spec-section voice" id="voice">
      <header class="section-hd">
        <span class="section-num">[09]</span>
        <h2 class="section-title">Voice & Tone</h2>
      </header>
      <div class="section-content">
        <div class="voice-grid">
          {#each voiceGuidelines as g}
            <div class="voice-card">
              <h3 class="voice-attr">{g.attribute}</h3>
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

    <!-- ── [10] Manifesto ──────────────────────────── -->
    <section class="spec-section principles" id="manifesto">
      <header class="section-hd">
        <span class="section-num">[10]</span>
        <h2 class="section-title">Manifesto</h2>
      </header>
      <div class="section-content">
        <div class="manifesto-list">
          {#each principles as p}
            <article class="principle-card">
              <span class="p-num">{p.number}</span>
              <div class="p-body">
                <h3 class="p-name">{p.name}</h3>
                <p class="p-desc">{p.description}</p>
              </div>
            </article>
          {/each}
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

  /* ── Spec TOC ────────────────────────────────── */
  .spec-toc {
    padding: var(--space-md) 0;
  }

  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .toc-list a {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--color-ink-500);
    letter-spacing: 0.05em;
    background: var(--surface-raised);
    padding: 2px 8px;
    border: 1px solid var(--surface-color);
    transition: all var(--duration-fast) var(--ease-out-quart);
  }

  .toc-list a:hover {
    background: var(--color-primary-500);
    color: var(--color-canvas-50);
    border-color: var(--color-primary-500);
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
  }

  .spec-title {
    font-size: clamp(2.5rem, 8vw, 5rem);
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
    grid-template-columns: 200px 1fr;
    gap: var(--space-xl);
    padding-top: var(--space-lg);
    scroll-margin-top: var(--space-xl);
  }

  @media (max-width: 900px) {
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
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 800;
    margin: 0;
    color: var(--color-ink-950);
  }

  .section-intro {
    font-size: var(--text-sm);
    color: var(--color-ink-700);
    max-width: 65ch;
    margin: 0 0 var(--space-lg);
  }

  /* ── [01] Identity ───────────────────────────── */
  .id-card {
    background: var(--surface-raised);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-width: 500px;
  }

  .id-header {
    background: var(--color-ink-950);
    color: var(--color-canvas-50);
    font-size: 10px;
    font-weight: 800;
    padding: 4px 12px;
    letter-spacing: 0.1em;
  }

  .id-fields {
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin: 0;
  }

  .id-fields dt {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--color-ink-500);
    margin-bottom: 2px;
  }

  .id-fields dd {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-ink-950);
  }

  .logo-sample {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  /* ── [02] Colour ─────────────────────────────── */
  .palette-stacks {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .palette-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .palette-info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid var(--surface-color);
    padding-bottom: 4px;
  }

  .stack-name {
    font-size: var(--text-xs);
    font-weight: 700;
    margin: 0;
  }

  .stack-prefix {
    font-size: 10px;
    color: var(--color-ink-500);
  }

  .swatch-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: var(--space-2xs);
  }

  .swatch-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }

  .swatch {
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--radius-xs);
  }

  .swatch-val {
    font-size: 9px;
    font-family: var(--font-mono);
    color: var(--color-ink-500);
  }

  .surface-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-md);
    margin-top: var(--space-md);
  }

  .surface-card {
    border: 1px solid var(--surface-color);
    background: var(--surface-raised);
    border-radius: var(--radius-sm);
    padding: var(--space-sm);
    display: flex;
    gap: var(--space-sm);
    align-items: center;
  }

  .surface-preview {
    width: 48px;
    height: 48px;
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-xs);
    flex-shrink: 0;
  }

  .surface-meta {
    display: flex;
    flex-direction: column;
  }

  .surface-label {
    font-size: var(--text-xs);
    font-weight: 700;
    text-transform: uppercase;
  }

  .surface-token {
    font-size: 10px;
    color: var(--color-ink-500);
  }

  /* ── [03] Typography ─────────────────────────── */
  .type-specimen {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    background: var(--surface-raised);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  .font-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-ink-500);
    display: block;
    margin-bottom: var(--space-xs);
  }

  .font-display {
    font-size: clamp(1.5rem, 5vw, 3rem);
    color: var(--color-ink-950);
    line-height: 1;
  }

  .scale-table {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .table-hd {
    display: grid;
    grid-template-columns: 120px 1fr 80px;
    gap: var(--space-md);
    padding: 8px 16px;
    background: var(--color-ink-950);
    color: var(--color-canvas-50);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.1em;
  }

  .table-row {
    display: grid;
    grid-template-columns: 120px 1fr 80px;
    gap: var(--space-md);
    padding: 16px;
    border-bottom: 1px solid var(--surface-color);
    align-items: center;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-token {
    font-size: 10px;
    color: var(--color-ink-500);
  }

  .table-sample {
    color: var(--color-ink-950);
  }

  .table-weight {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-ink-500);
    text-align: right;
  }

  /* ── [04] Geometry ───────────────────────────── */
  .geo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
  }

  @media (max-width: 700px) {
    .geo-grid {
      grid-template-columns: 1fr;
    }
  }

  .sub-title {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    margin: 0 0 var(--space-md);
    color: var(--color-ink-600);
  }

  .spacing-map {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .spacing-entry {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .spacing-entry .token {
    width: 100px;
    font-size: 10px;
    color: var(--color-ink-500);
  }

  .bar-wrap {
    flex: 1;
  }

  .bar {
    height: 12px;
    background: var(--color-primary-500);
    opacity: 0.6;
  }

  .spacing-entry .value {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--color-ink-600);
    width: 40px;
    text-align: right;
  }

  .radii-map {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--space-md);
  }

  .radius-entry {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .radius-box {
    width: 48px;
    height: 48px;
    background: var(--surface-raised);
    border: 1px solid var(--surface-color);
  }

  .radius-entry .token {
    font-size: 9px;
    color: var(--color-ink-500);
  }

  .radius-entry .value {
    font-size: 9px;
    color: var(--color-ink-400);
  }

  /* ── [05] Motion ─────────────────────────────── */
  .motion-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
  }

  .token-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px dashed var(--surface-color);
  }

  .token-item .name {
    font-size: var(--text-xs);
    color: var(--color-ink-800);
  }

  .token-item .val {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--color-ink-500);
  }

  /* ── [06] Iconography ────────────────────────── */
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--space-md);
  }

  .icon-card {
    border: 1px solid var(--surface-color);
    background: var(--surface-raised);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .icon-preview {
    color: var(--color-ink-950);
  }

  .icon-name {
    font-size: 9px;
    color: var(--color-ink-500);
    font-family: var(--font-mono);
  }

  /* ── [07] Components ─────────────────────────── */
  .component-demo-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .interactive-demo {
    display: flex;
    gap: var(--space-xl);
    flex-wrap: wrap;
    background: var(--surface-raised);
    padding: var(--space-lg);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-lg);
  }

  .demo-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    align-items: flex-start;
  }

  .demo-label {
    font-size: 9px;
    font-family: var(--font-mono);
    color: var(--color-ink-500);
    text-transform: uppercase;
  }

  /* ── [08] Layout ─────────────────────────────── */
  .shell-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .shell-viz-row {
    display: grid;
    grid-template-columns: 180px 1fr auto;
    gap: var(--space-lg);
    align-items: center;
  }

  @media (max-width: 700px) {
    .shell-viz-row {
      grid-template-columns: 1fr;
      gap: var(--space-xs);
    }
  }

  .shell-info {
    display: flex;
    flex-direction: column;
  }

  .shell-name {
    font-size: var(--text-sm);
    font-weight: 700;
  }

  .shell-token {
    font-size: 10px;
    color: var(--color-ink-500);
  }

  .shell-bar-wrap {
    flex: 1;
    background: var(--surface-raised);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-sm);
    overflow: hidden;
    height: 24px;
    display: flex;
    align-items: center;
  }

  .shell-bar {
    height: 100%;
    background: var(--color-primary-500);
    opacity: 0.3;
    display: flex;
    align-items: center;
    padding-left: 8px;
  }

  .shell-val {
    font-size: 9px;
    font-family: var(--font-mono);
    color: var(--color-ink-950);
    font-weight: 700;
  }

  .shell-usage-note {
    font-size: 11px;
    color: var(--color-ink-500);
    margin: 0;
    max-width: 150px;
  }

  /* ── [09] Voice & Tone ───────────────────────── */
  .voice-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-lg);
  }

  .voice-card {
    border: 1px solid var(--surface-color);
    background: var(--surface-raised);
    border-radius: var(--radius-md);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .voice-attr {
    background: var(--color-ink-950);
    color: var(--color-canvas-50);
    padding: 8px 16px;
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 800;
    margin: 0;
  }

  .voice-rules {
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .rule {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .rule-label {
    font-size: 9px;
    font-family: var(--font-mono);
    font-weight: 800;
    letter-spacing: 0.05em;
  }

  .do .rule-label { color: var(--color-primary-500); }
  .dont .rule-label { color: var(--color-secondary-500); }

  .rule p {
    font-size: var(--text-xs);
    margin: 0;
    line-height: 1.5;
    color: var(--color-ink-800);
  }

  /* ── [10] Manifesto ──────────────────────────── */
  .manifesto-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .principle-card {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: var(--space-md);
  }

  .p-num {
    font-family: var(--font-mono);
    font-size: var(--text-md);
    font-weight: 800;
    color: var(--color-primary-500);
    line-height: 1.2;
  }

  .p-name {
    font-size: var(--text-md);
    font-weight: 800;
    margin: 0 0 4px;
    text-transform: uppercase;
    letter-spacing: -0.01em;
  }

  .p-desc {
    font-size: var(--text-sm);
    color: var(--color-ink-700);
    margin: 0;
    line-height: 1.6;
    max-width: 60ch;
  }

  /* ── Utils ────────────────────────────────────── */
  @media (max-width: 600px) {
    .hide-mobile {
      display: none;
    }
    
    .table-hd, .table-row {
      grid-template-columns: 100px 1fr;
    }

    .spec-title {
      font-size: 2.5rem;
    }

    .motion-layout, .geo-grid {
      grid-template-columns: 1fr;
    }

    .shell-viz-row {
      grid-template-columns: 1fr;
    }
  }
</style>
