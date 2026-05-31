<script lang="ts">
  import Now from '$lib/components/Now.svelte';
  import SiteHead from '$lib/components/SiteHead.svelte';
  import { ArrowRight, ExternalLink, Music } from '@lucide/svelte';
  import { normalizeSlug } from '$lib/utils/slugify';
  import type { ProfileData, MusicStatusData, KibunStatusData } from '@ewanc26/atproto';

  let { data } = $props();

  let profile = $derived(data.profile as ProfileData);
  let musicStatus = $derived(data.musicStatus as MusicStatusData | null);
  let kibunStatus = $derived(data.kibunStatus as KibunStatusData | null);

  function getBlogUrl(post: any) {
    const date = new Date(post.createdAt);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const slug = normalizeSlug(post.title);
    return `/blog/${y}/${m}/${d}/${slug}`;
  }
</script>

<SiteHead />

<main class="shell-wide">
  <!-- Hero -->
  <section class="page-hd">
    {#if profile.avatar}
      <img src={profile.avatar} alt="" class="hero-avatar" />
    {/if}
    <div class="hero-text">
      <h1 class="page-title">{profile.displayName ?? profile.handle}</h1>
      <p class="hero-bio">{profile.description}</p>
    </div>
  </section>

  <!-- Status row -->
  <div class="status-row">
    {#if kibunStatus}
      <div class="status-chip">
        <span class="status-emoji">{kibunStatus.emoji}</span>
        <span class="status-text">{kibunStatus.text}</span>
      </div>
    {/if}
    {#if musicStatus}
      <div class="status-chip">
        <Music size={14} strokeWidth={2} style="opacity: 0.6;" />
        <span class="status-text">{musicStatus.trackName} — {musicStatus.artists.map((a: any) => a.artistName).join(', ')}</span>
      </div>
    {/if}
  </div>

  <!-- Writing -->
  <section class="home-section">
    <h2 class="section-heading">{data.blog?.title ?? 'Blog'}</h2>
    <ul class="post-list">
      {#each data.posts as post}
        <li>
          <a href={getBlogUrl(post)} class="post-row">
            <span class="post-title">{post.title}</span>
            <time class="post-date">{new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
          </a>
        </li>
      {/each}
    </ul>
    <a href="/blog" class="section-link">All posts <ArrowRight size={14} strokeWidth={2} /></a>
  </section>

  <!-- Projects -->
  {#if data.projects.length > 0}
    <section class="home-section">
      <h2 class="section-heading">Projects</h2>
      <div class="project-grid">
        {#each data.projects as project}
          <div class="project-card">
            <strong class="project-name">{project.name}</strong>
            {#if project.description}
              <p class="project-desc">{project.description}</p>
            {/if}
            {#if project.url}
              <a href={project.url} target="_blank" rel="noopener" class="project-link">
                View <ExternalLink size={10} strokeWidth={2} />
              </a>
            {/if}
          </div>
        {/each}
      </div>
      <a href="/projects" class="section-link">All projects <ArrowRight size={14} strokeWidth={2} /></a>
    </section>
  {/if}

  <!-- Publications -->
  {#if data.publications.length > 0}
    <section class="home-section">
      <h2 class="section-heading">Publications</h2>
      <ul class="post-list">
        {#each data.publications as pub}
          <li>
            <a href={pub.url} target="_blank" rel="noopener" class="post-row">
              <span class="post-title">{pub.name}</span>
              <span class="post-date" style="max-width: 50%; text-align: right;">{pub.description}</span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <!-- Links -->
  {#if data.links.length > 0}
    <section class="home-section">
      <h2 class="section-heading">Elsewhere</h2>
      <div class="link-grid">
        {#each data.links as link}
          <a href={link.url} target="_blank" rel="noopener" class="link-chip">
            {#if link.emoji}
              <span class="link-emoji">{link.emoji}</span>
            {/if}
            <span class="link-text">{link.text}</span>
            <ExternalLink size={10} strokeWidth={2} style="opacity: 0.3;" />
          </a>
        {/each}
      </div>
    </section>
  {/if}
</main>

<style>
  /* Hero */
  .page-hd {
    padding: var(--space-xl) 0 var(--space-lg);
    display: flex;
    gap: var(--space-lg);
    align-items: flex-start;
  }

  .hero-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .hero-bio {
    margin: 0;
    color: var(--color-ink-700);
    font-size: var(--text-md);
    max-width: 55ch;
    line-height: 1.6;
  }

  .hero-avatar {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-lg);
    object-fit: cover;
    flex-shrink: 0;
    aspect-ratio: 1;
    background-color: var(--surface-raised);
  }

  @media (min-width: 900px) {
    .hero-avatar {
      width: 128px;
      height: 128px;
    }
  }

  /* Status row */
  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    padding-bottom: var(--space-lg);
  }

  .status-chip {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    font-size: var(--text-sm);
  }

  .status-emoji {
    font-size: 1.2em;
  }

  .status-text {
    color: var(--color-ink-700);
  }

  /* Sections */
  .home-section {
    padding: var(--space-lg) 0;
    content-visibility: auto;
    contain-intrinsic-size: auto 300px;
  }

  /* Project grid */
  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-sm);
  }

  .project-card {
    padding: var(--space-md);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .project-name {
    font-size: var(--text-md);
    font-weight: 600;
  }

  .project-desc {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .project-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    margin-top: auto;
    font-size: var(--text-sm);
    color: var(--color-primary-500);
    text-decoration: none;
  }

  /* Links grid */
  .link-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .link-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    font-size: var(--text-sm);
    text-decoration: none;
    color: inherit;
    transition: border-color var(--duration-fast) var(--ease-out-quart);
  }

  .link-chip:hover {
    border-color: var(--color-primary-500);
    color: var(--color-primary-500);
  }

  .link-emoji {
    font-size: 1.1em;
  }

  .link-text {
    white-space: nowrap;
  }

  /* Responsive */
  @media (max-width: 560px) {
    .hero-avatar {
      width: 48px;
      height: 48px;
    }
  }
</style>