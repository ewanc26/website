<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';
  import { ExternalLink } from '@lucide/svelte';
  import type {
    ProfileData,
    SifaSkill,
    SifaEducation,
    SifaLanguage,
    SifaExternalAccount,
    SifaProject
  } from '@ewanc26/atproto';

  let { data } = $props();

  let profile = $derived(data.profile as ProfileData);

  // Helper functions remain same
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

  let copiedIndex = $state<'did' | null>(null);

  async function copyToClipboard(text: string, id: 'did') {
    await navigator.clipboard.writeText(text);
    copiedIndex = id;
    setTimeout(() => (copiedIndex = null), 2000);
  }
</script>

<SiteHead title="About" description={profile.description} ogType="ABOUT" />

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
      {#await data.lazy.sifaProfile}
        <LoadingSkeleton />
      {:then sifaProfile}
        {#if sifaProfile}
          <p class="about-headline">{sifaProfile.headline}</p>
        {/if}
      {/await}
      {#if profile.description}
        <p class="about-bio">{profile.description}</p>
      {/if}
    </div>
  </header>

  <div class="about-grid">
    <div class="about-main">
      <section class="about-section">
        <h2 class="section-heading">Skills</h2>
        {#await data.lazy.sifaSkills}
          <LoadingSkeleton count={3} />
        {:then sifaSkills}
          {#if sifaSkills && sifaSkills.length > 0}
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
          {:else}
            <EmptyState
              title="Skills"
              description="Unable to load skills at the moment. Please try again later."
              icon={false}
            />
          {/if}
        {/await}
      </section>

      <section class="about-section">
        <h2 class="section-heading">Education</h2>
        {#await data.lazy.sifaEducation}
          <LoadingSkeleton count={2} />
        {:then sifaEducation}
          {#if sifaEducation && sifaEducation.length > 0}
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
          {:else}
            <EmptyState
              title="Education"
              description="Unable to load education information at the moment. Please try again later."
              icon={false}
            />
          {/if}
        {/await}
      </section>

      <section class="about-section">
        <h2 class="section-heading">Projects</h2>
        {#await data.lazy.sifaProjects}
          <LoadingSkeleton count={3} />
        {:then sifaProjects}
          {#if sifaProjects && sifaProjects.length > 0}
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
          {:else}
            <EmptyState
              title="Projects"
              description="Unable to load projects at the moment. Please try again later."
              icon={false}
            />
          {/if}
        {/await}
      </section>
    </div>

    <aside class="about-sidebar">
      <section class="sidebar-section">
        <h2 class="section-heading">Languages</h2>
        {#await data.lazy.sifaLanguages}
          <LoadingSkeleton count={2} />
        {:then sifaLanguages}
          {#if sifaLanguages && sifaLanguages.length > 0}
            <ul class="bare-list">
              {#each sifaLanguages as lang}
                <li class="post-row">
                  <span>{lang.name}</span>
                  <span class="lang-prof">{formatLanguageProficiency(lang.proficiency)}</span>
                </li>
              {/each}
            </ul>
          {:else}
            <EmptyState
              title="Languages"
              description="Unable to load languages at the moment. Please try again later."
              icon={false}
            />
          {/if}
        {/await}
      </section>

      <section class="sidebar-section">
        <h2 class="section-heading">Links</h2>
        {#await data.lazy.sifaExternalAccounts}
          <LoadingSkeleton count={3} />
        {:then sifaExternalAccounts}
          {#if sifaExternalAccounts && sifaExternalAccounts.length > 0}
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
          {:else}
            <EmptyState
              title="Links"
              description="Unable to load links at the moment. Please try again later."
              icon={false}
            />
          {/if}
        {/await}
      </section>

      {#await data.lazy.links}
        <section class="sidebar-section">
          <LoadingSkeleton count={3} />
        </section>
      {:then links}
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
      {/await}

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
          <dt>Name</dt>
          <dd><a href="/about/name" class="id-link">About my name &rarr;</a></dd>
        </dl>
      </section>
    </aside>
  </div>
</main>
