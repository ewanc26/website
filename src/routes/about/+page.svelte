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

  const profile = data.profile as ProfileData;
  const links = data.links as LinkData | null;
  const sifaProfile = data.sifaProfile as SifaProfileData | null;
  const sifaSkills = data.sifaSkills as SifaSkill[];
  const sifaEducation = data.sifaEducation as SifaEducation[];
  const sifaLanguages = data.sifaLanguages as SifaLanguage[];
  const sifaExternalAccounts = data.sifaExternalAccounts as SifaExternalAccount[];
  const sifaProjects = data.sifaProjects as SifaProject[];

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

  function formatDate(dateStr: string): string {
    const [year, month] = dateStr.split('-');
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month)]} ${year}`;
  }
</script>

<SiteHead title="About" description={profile.description} />

<main class="shell-wide">
  <header class="page-hd">
    <div class="about-hero">
      {#if profile.avatar}
        <img src={profile.avatar} alt="{profile.displayName}'s avatar" class="about-avatar" />
      {/if}
      <div>
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
    </div>
  </header>

  <div class="about-grid">
    <div class="about-main">
      {#if sifaSkills.length > 0}
        <section class="about-section">
          <h2 class="section-heading">Skills</h2>
          {#each groupSkillsByCategory(sifaSkills) as [category, skills]}
            <div class="skill-group">
              <h3 class="skill-category">{category}</h3>
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
          <ul class="edu-list">
            {#each sifaEducation as edu}
              <li class="edu-item">
                <div class="edu-header">
                  <strong class="edu-degree">{edu.degree}</strong>
                  <span class="edu-dates">
                    {formatDate(edu.startedAt)} — {edu.endedAt ? formatDate(edu.endedAt) : 'Present'}
                  </span>
                </div>
                <p class="edu-institution">{edu.institution}</p>
                {#if edu.description}
                  <p class="edu-desc">{edu.description}</p>
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if sifaProjects.length > 0}
        <section class="about-section">
          <h2 class="section-heading">Projects</h2>
          <ul class="project-list">
            {#each sifaProjects as project}
              <li class="project-item">
                <div class="project-header">
                  <strong class="project-name">{project.name}</strong>
                  {#if project.url}
                    <a href={project.url} target="_blank" rel="noopener" class="project-link">
                      <ExternalLink size={12} strokeWidth={2} />
                    </a>
                  {/if}
                </div>
                {#if project.description}
                  <p class="project-desc">{project.description}</p>
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/if}
    </div>

    <aside class="about-sidebar">
      {#if sifaLanguages.length > 0}
        <section class="sidebar-section">
          <h2 class="sidebar-heading">Languages</h2>
          <ul class="lang-list">
            {#each sifaLanguages as lang}
              <li class="lang-item">
                <span class="lang-name">{lang.name}</span>
                <span class="lang-prof">{formatLanguageProficiency(lang.proficiency)}</span>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if sifaExternalAccounts.length > 0}
        <section class="sidebar-section">
          <h2 class="sidebar-heading">Links</h2>
          <ul class="link-list">
            {#each sifaExternalAccounts as account}
              <li>
                <a href={account.url} target="_blank" rel="noopener" class="link-item">
                  {account.label || account.url.replace('https://', '')}
                  <ExternalLink size={10} strokeWidth={2} style="opacity: 0.4; flex-shrink: 0;" />
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if links?.cards?.length}
        <section class="sidebar-section">
          <h2 class="sidebar-heading">Elsewhere</h2>
          <ul class="link-list">
            {#each links.cards as card}
              <li>
                <a href={card.url} target="_blank" rel="noopener" class="link-item">
                  {card.emoji} {card.text}
                  <ExternalLink size={10} strokeWidth={2} style="opacity: 0.4; flex-shrink: 0;" />
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <section class="sidebar-section">
        <h2 class="sidebar-heading">Identity</h2>
        <dl class="id-list">
          <dt>DID</dt>
          <dd><code class="id-code">{profile.did}</code></dd>
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
  .page-hd {
    padding: var(--space-lg) 0;
  }

  .about-hero {
    display: flex;
    gap: var(--space-lg);
    align-items: flex-start;
  }

  .about-avatar {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .page-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0;
  }

  .about-pronouns {
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    margin: var(--space-xs) 0 0;
  }

  .about-headline {
    font-size: var(--text-md);
    color: var(--color-ink-700);
    margin: var(--space-sm) 0 0;
  }

  .about-bio {
    margin: var(--space-md) 0 0;
    line-height: 1.75;
    max-width: 70ch;
  }

  /* Two-column layout */
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: var(--space-lg);
    padding: var(--space-lg) 0;
    align-items: start;
  }

  .about-sidebar {
    position: sticky;
    top: 72px;
    height: max-content;
  }

  /* Sections */
  .about-section {
    margin-bottom: var(--space-lg);
  }

  .section-heading {
    font-size: var(--text-sm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink-600);
    margin: 0 0 var(--space-md);
  }

  /* Skills */
  .skill-group {
    margin-bottom: var(--space-md);
  }

  .skill-category {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-ink-700);
    margin: 0 0 var(--space-sm);
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
    background: var(--surface-raised);
  }

  /* Education */
  .edu-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .edu-item {
    padding-bottom: var(--space-md);
    border-bottom: 1px dashed var(--surface-color);
  }

  .edu-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .edu-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-sm);
  }

  .edu-degree {
    font-size: var(--text-md);
  }

  .edu-dates {
    font-size: var(--text-xs);
    color: var(--color-ink-600);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .edu-institution {
    margin: var(--space-xs) 0 0;
    font-size: var(--text-sm);
    color: var(--color-ink-700);
  }

  .edu-desc {
    margin: var(--space-xs) 0 0;
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    white-space: pre-wrap;
    line-height: 1.6;
  }

  /* Projects */
  .project-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .project-item {
    padding: var(--space-sm);
    border: 1px solid var(--surface-color);
  }

  .project-header {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .project-name {
    font-size: var(--text-md);
  }

  .project-link {
    color: var(--color-ink-600);
    display: flex;
    align-items: center;
  }

  .project-link:hover {
    color: var(--color-primary-500);
  }

  .project-desc {
    margin: var(--space-xs) 0 0;
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    line-height: 1.6;
  }

  /* Sidebar */
  .sidebar-section {
    margin-bottom: var(--space-lg);
  }

  .sidebar-heading {
    font-size: var(--text-sm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink-600);
    margin: 0 0 var(--space-sm);
  }

  /* Languages */
  .lang-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .lang-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: var(--text-sm);
  }

  .lang-name {
    font-weight: 600;
  }

  .lang-prof {
    color: var(--color-ink-600);
    font-size: var(--text-xs);
  }

  /* Links */
  .link-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  .link-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--text-sm);
    text-decoration: none;
    color: inherit;
    padding: var(--space-2xs) 0;
  }

  .link-item:hover {
    color: var(--color-primary-500);
  }

  /* Identity */
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
  }

  .id-list dd {
    margin: 0;
  }

  .id-code {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    word-break: break-all;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .about-grid {
      grid-template-columns: 1fr;
    }

    .about-sidebar {
      position: static;
      height: auto;
    }
  }

  @media (max-width: 560px) {
    .about-hero {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .about-avatar {
      width: 64px;
      height: 64px;
    }
  }
</style>
