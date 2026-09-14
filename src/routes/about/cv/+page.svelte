<script lang="ts">
  import SiteHead from "$lib/components/SiteHead.svelte";
  import { Copy, Check, Terminal } from "@lucide/svelte";

  let { data } = $props();

  const curlCommand = "curl -fsSL ewancroft.uk/cv | bash";
  let copied = $state(false);

  async function copyCurl() {
    try {
      await navigator.clipboard?.writeText(curlCommand);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      copied = false;
    }
  }

  const cv = $derived(data.cv);

  const sections = $derived([
    { key: "1", label: "Profile" },
    { key: "2", label: "Methodology" },
    { key: "3", label: "Skills" },
    { key: "4", label: "Selected projects" },
    { key: "5", label: "Projects" },
    { key: "6", label: "Experience" },
    { key: "7", label: "Education" },
    { key: "8", label: "Languages & links" },
  ]);
</script>

<SiteHead
  title="CV"
  description="Interactive terminal CV for Ewan Croft — aggregate of live AT Protocol records, served as a bash script."
  ogSubtitle="Interactive terminal CV."
  ogType="CV"
/>

<main class="shell-narrow cv-page">
  <header class="spec-header">
    <div class="spec-meta">
      <span class="meta-tag">TERMINAL CV</span>
      <span class="meta-tag">AT PROTOCOL</span>
      <span class="meta-tag">LIVE DATA</span>
    </div>
    <h1 class="page-title">CV</h1>
    <p class="spec-abstract">
      A fully interactive CV that lives in the terminal. It aggregates the same
      AT Protocol records as the about page — skills, education, languages,
      projects — served as a self-contained bash script.
    </p>
  </header>

  <div class="panel cv-command-panel">
    <div class="panel-head">
      <Terminal size={14} aria-hidden="true" />
      ewan@ewancroft.uk:~$
    </div>
    <div class="panel-body">
      <div class="cv-command-row">
        <code class="cv-command">{curlCommand}</code>
        <button class="copy-btn copy-btn--compact" onclick={copyCurl}>
          {#if copied}
            <Check size={14} aria-hidden="true" />
          {:else}
            <Copy size={14} aria-hidden="true" />
          {/if}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <p class="cv-command-note">
        Menu-driven, reads from <code>/dev/tty</code>, falls back to plain text
        when piped. Single sections work too:
        <code>curl -fsSL ewancroft.uk/cv | bash -s -- skills</code>.
      </p>
    </div>
  </div>

  <section class="cv-section">
    <h2 class="section-title">Menu</h2>
    <ul class="bare-list cv-menu">
      {#each sections as section (section.key)}
        <li class="cv-menu-row">
          <span class="cv-menu-key">{section.key}</span>
          <span class="cv-menu-label">{section.label}</span>
        </li>
      {/each}
      <li class="cv-menu-row">
        <span class="cv-menu-key">a</span>
        <span class="cv-menu-label">All sections</span>
      </li>
      <li class="cv-menu-row">
        <span class="cv-menu-key">q</span>
        <span class="cv-menu-label">Quit</span>
      </li>
    </ul>
  </section>

  <section class="cv-section">
    <h2 class="section-title">At a glance</h2>
    <dl class="meta-list cv-facts">
      {#each [
        { label: "Name", value: cv.name },
        { label: "Headline", value: cv.headline },
        { label: "Location", value: cv.location },
        { label: "Skills", value: `${cv.skillGroups.reduce((n, g) => n + g.skills.length, 0)} across ${cv.skillGroups.length} categories` },
        { label: "Projects", value: `${cv.selectedProjects.length + cv.recordProjects.length} listed` },
        { label: "Languages", value: cv.languages.map((l) => l.name).join(", ") },
      ] as fact (fact.label)}
        <div class="cv-fact">
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      {/each}
    </dl>
    <p class="cv-updated">
      Generated {cv.generatedAt} from
      <code>did:plc:ofrbh253gwicbkc5nktqepol</code>
    </p>
  </section>
</main>

<style>
  .cv-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .cv-command-panel {
    margin-top: var(--space-md);
  }

  .cv-command-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }

  .cv-command {
    font-size: var(--text-sm);
    overflow-wrap: anywhere;
  }

  .cv-command-note {
    margin: var(--space-sm) 0 0;
    font-size: var(--text-sm);
    color: var(--color-text-600);
  }

  .cv-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .cv-menu {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    padding: var(--space-xs);
    background: var(--surface-raised);
    border-radius: var(--radius-md);
  }

  .cv-menu-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
    padding: var(--space-2xs) var(--space-2xs);
    border-radius: var(--radius-sm);
  }

  .cv-menu-key {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-accent-600);
    min-width: 1.25rem;
    text-align: center;
    border: 1px solid var(--surface-color);
    background: var(--surface-sunken);
    padding: 1px 4px;
    border-radius: var(--radius-xs);
  }

  .cv-menu-label {
    font-size: var(--text-sm);
  }

  .cv-facts {
    gap: var(--space-xs);
  }

  .cv-fact {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-sm);
    padding: var(--space-2xs) var(--space-2xs);
  }

  .cv-fact dt {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-600);
    flex-shrink: 0;
  }

  .cv-fact dd {
    margin: 0;
    font-size: var(--text-sm);
    text-align: right;
    overflow-wrap: anywhere;
  }

  .cv-updated {
    margin: var(--space-xs) 0 0;
    font-size: var(--text-xs);
    color: var(--color-text-600);
  }
</style>
