<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';
  import { ExternalLink } from '@lucide/svelte';
  import type {
    ProfileData,
    LinkData,
    SifaProfileData,
    SifaSkill,
    SifaEducation,
    SifaLanguage,
    SifaExternalAccount,
    SifaProject
  } from '@ewanc26/atproto';

  let { data } = $props();

  let profile = $derived(data.profile as ProfileData);
  let links = $derived(data.links as LinkData | null);
  let sifaProfile = $derived(data.sifaProfile as SifaProfileData | null);
  let sifaSkills = $derived(data.sifaSkills as SifaSkill[]);
  let sifaEducation = $derived(data.sifaEducation as SifaEducation[]);
  let sifaLanguages = $derived(data.sifaLanguages as SifaLanguage[]);
  let sifaExternalAccounts = $derived(data.sifaExternalAccounts as SifaExternalAccount[]);
  let sifaProjects = $derived(data.sifaProjects as SifaProject[]);

  let copiedIndex = $state<'did' | null>(null);

  async function copyToClipboard(text: string, id: 'did') {
    await navigator.clipboard.writeText(text);
    copiedIndex = id;
    setTimeout(() => (copiedIndex = null), 2000);
  }

  function formatSkillCategory(uri: string): string {
    const map: Record<string, string> = {
      'id.sifa.defs#technical': 'Technical',
      'id.sifa.defs#creative': 'Creative',
      'id.sifa.defs#industry': 'Industry',
      'id.sifa.defs#soft': 'Soft Skills'
    };
    return map[uri] ?? uri.split('#')[1] ?? 'Other';
  }

  function formatLanguageProficiency(uri: string): string {
    const map: Record<string, string> = {
      'id.sifa.defs#native': 'Native',
      'id.sifa.defs#fluent': 'Fluent',
      'id.sifa.defs#limitedWorking': 'Limited working',
      'id.sifa.defs#elementary': 'Elementary'
    };
    return map[uri] ?? uri.split('#')[1] ?? uri;
  }

  function groupSkillsByCategory(skills: SifaSkill[]): Map<string, SifaSkill[]> {
    const grouped = new Map<string, SifaSkill[]>();
    for (const skill of skills) {
      const cat = formatSkillCategory(skill.category);
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(skill);
    }
    return grouped;
  }

  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'Unknown';
    const [year, month] = dateStr.split('-');
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month)] ?? 'Jan'} ${year}`;
  }
</script>

<SiteHead title="About" description={profile.description} ogType="PROFILE" />

<main class="shell-wide">
  <header class="page-hd about-hero">
    {#if profile.avatar}
      <img src={profile.avatar} alt="{profile.displayName}'s avatar" class="about-avatar" />
    {/if}
    <div class="about-intro">
      <h1 class="page-title">{profile.displayName ?? profile.handle}</h1>
      {#if profile.pronouns}
        <p class="about-pronouns">{profile.pronouns}</p>
      {/if}
      {#if sifaProfile}
        <p class="about-headline">{sifaProfile.headline}</p>
      {/if}
      {#if profile.description}
        <p class="about-bio">{profile.description}</p>
      {/if}
    </div>
  </header>

  <div class="about-grid">
    <div class="about-main">
      {#if sifaSkills.length > 0}
        <section class="about-section">
          <h2 class="section-heading">Skills</h2>
          {#each groupSkillsByCategory(sifaSkills) as [category, skills]}
            <div class="skill-group">
              <h3 class="sub-heading">{category}</h3>
              <ul class="skill-list">
                {#each skills as skill}
                  <li class="skill-tag">{skill.name}</li>
                {/each}
              </ul>
            </div>
          {/each}
        </section>
      {/if}

      {#if sifaEducation.length > 0}
        <section class="about-section">
          <h2 class="section-heading">Education</h2>
          <ul class="bare-list">
            {#each sifaEducation as edu}
              <li class="post-row">
                <div class="row-stack">
                  <strong class="edu-degree">{edu.degree}</strong>
                  <span class="edu-institution">{edu.institution}</span>
                </div>
                <span class="row-meta">
                  {formatDate(edu.startedAt)} — {edu.endedAt ? formatDate(edu.endedAt) : 'Present'}
                </span>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if sifaProjects.length > 0}
        <section class="about-section">
          <h2 class="section-heading">Projects</h2>
          <ul class="bare-list">
            {#each sifaProjects as project}
              <li>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener"
                  class="post-row"
                >
                  <div class="row-stack">
                    <strong class="project-name">{project.name}</strong>
                    <span class="project-desc">{project.description}</span>
                  </div>
                  <ExternalLink size={14} strokeWidth={2} />
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/if}
    </div>

    <aside class="about-sidebar">
      {#if sifaLanguages.length > 0}
        <section class="sidebar-section">
          <h2 class="section-heading">Languages</h2>
          <ul class="bare-list">
            {#each sifaLanguages as lang}
              <li class="post-row">
                <span>{lang.name}</span>
                <span class="lang-prof">{formatLanguageProficiency(lang.proficiency)}</span>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if sifaExternalAccounts.length > 0}
        <section class="sidebar-section">
          <h2 class="section-heading">Links</h2>
          <ul class="bare-list">
            {#each sifaExternalAccounts as account}
              <li>
                <a href={account.url} target="_blank" rel="noopener" class="link-row">
                  {account.label || account.url.replace('https://', '')}
                  <ExternalLink size={12} strokeWidth={2} class="muted-icon" />
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if links?.cards?.length}
        <section class="sidebar-section">
          <h2 class="section-heading">Elsewhere</h2>
          <ul class="bare-list">
            {#each links.cards as card}
              <li>
                <a href={card.url} target="_blank" rel="noopener" class="link-row">
                  {card.emoji} {card.text}
                  <ExternalLink size={12} strokeWidth={2} class="muted-icon" />
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <section class="sidebar-section">
        <h2 class="section-heading">Identity</h2>
        <dl class="id-list">
          <dt>DID</dt>
          <dd>
            <button 
              type="button" 
              class="copy-btn copy-btn--compact" 
              onclick={() => copyToClipboard(profile.did, 'did')}
            >
              {copiedIndex === 'did' ? 'Copied' : 'Copy DID'}
            </button>
          </dd>
          <dt>Handle</dt>
          <dd><code class="id-code">{profile.handle}</code></dd>
          <dt>PDS</dt>
          <dd><code class="id-code">eurosky.social</code></dd>
        </dl>
      </section>
    </aside>
  </div>
</main>

<style>
  /* Hero */
  .about-hero {
    display: flex;
    gap: var(--space-md);
    align-items: flex-start;
  }

  .about-avatar {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-lg);
    object-fit: cover;
    flex-shrink: 0;
    aspect-ratio: 1;
    background-color: var(--surface-raised);
    margin-top: var(--space-xs);
  }

  .about-intro {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  .about-pronouns {
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    margin: 0;
  }

  .about-headline {
    font-size: var(--text-md);
    color: var(--color-ink-700);
    margin: var(--space-xs) 0 0;
  }

  .about-bio {
    margin: var(--space-sm) 0 0;
    line-height: 1.75;
    max-width: 65ch;
  }

  /* Two-column layout */
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: var(--space-lg);
    padding: var(--space-lg) 0;
    align-items: start;
  }

  @media (max-width: 900px) {
    .about-grid {
      grid-template-columns: 1fr;
    }
  }

  .about-main {
    min-width: 0;
  }

  /* Sidebar */
  .about-sidebar {
    position: sticky;
    top: 72px;
    height: max-content;
    min-width: 0;
  }

  /* Sections */
  .about-section {
    margin-bottom: var(--space-xl);
    content-visibility: auto;
    contain-intrinsic-size: auto 200px;
  }

  /* Skills */
  .skill-group {
    margin-bottom: var(--space-md);
  }

  .skill-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .skill-tag {
    font-size: var(--text-sm);
    padding: 2px 10px;
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--color-ink-800);
  }

  /* Education */
  .edu-degree {
    font-size: var(--text-md);
    font-weight: 600;
  }

  .edu-institution {
    margin: var(--space-2xs) 0 0;
    font-size: var(--text-sm);
    color: var(--color-ink-700);
  }

  /* Projects */
  .project-name {
    font-size: var(--text-md);
    font-weight: 600;
  }

  .project-desc {
    margin: var(--space-2xs) 0 0;
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    line-height: 1.6;
    max-width: 65ch;
  }

  /* Sidebar */
  .sidebar-section {
    margin-bottom: var(--space-lg);
  }

  /* Languages */
  .lang-prof {
    color: var(--color-ink-600);
    font-size: var(--text-xs);
  }

  /* Identity DL */
  .id-list {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-xs) var(--space-sm);
    font-size: var(--text-sm);
    margin: 0;
  }

  .id-list dt {
    color: var(--color-ink-600);
    font-weight: 600;
    align-self: start;
    padding-top: 2px;
  }

  .id-list dd {
    margin: 0;
    min-width: 0;
  }

  .id-code {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    max-width: 100%;
  }

  /* Copy button */
  .copy-btn {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-primary-500);
    background: none;
    border: 1px solid currentColor;
    cursor: pointer;
    transition:
      background-color var(--duration-fast) var(--ease-out-quart),
      color var(--duration-fast) var(--ease-out-quart);
  }

  .copy-btn:hover {
    background: var(--color-primary-500);
    color: var(--color-canvas-50);
  }

  /* Responsive */
  @media (max-width: 560px) {
    .about-avatar {
      width: 56px;
      height: 56px;
    }
  }
</style>
