<script lang="ts">
  import Now from '$lib/components/Now.svelte';
  import SiteHead from '$lib/components/SiteHead.svelte';
  import { ArrowRight, ExternalLink, Music } from '@lucide/svelte';
  import { normalizeSlug } from '$lib/utils/slugify';
  import type { ProfileData, MusicStatusData, KibunStatusData } from '@ewanc26/atproto';

  let { data } = $props();

  const profile = data.profile as ProfileData;
  const musicStatus = data.musicStatus as MusicStatusData | null;
  const kibunStatus = data.kibunStatus as KibunStatusData | null;

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
  <section class="hero">
    <div class="hero-text">
      <div class="hero-title-row">
        {#if profile.avatar}
          <img src={profile.avatar} alt="" class="hero-avatar" />
        {/if}
        <h1 class="hero-title">{profile.displayName ?? profile.handle}</h1>
      </div>
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
    <h2 class="section-title">{data.blog?.title ?? 'Blog'}</h2>
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
      <h2 class="section-title">Projects</h2>
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
      <h2 class="section-title">Publications</h2>
      <ul class="pub-list">
        {#each data.publications as pub}
          <li>
            <a href={pub.url} target="_blank" rel="noopener" class="pub-row">
              <span class="pub-name">{pub.name}</span>
              {#if pub.description}
                <span class="pub-desc">{pub.description}</span>
              {/if}
              <ExternalLink size={12} strokeWidth={2} style="opacity: 0.3; flex-shrink: 0;" />
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <!-- Links -->
  {#if data.links.length > 0}
    <section class="home-section">
      <h2 class="section-title">Elsewhere</h2>
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
  .hero {
    padding: var(--space-xl) 0 var(--space-lg);
    contain: layout;
  }

  .hero-title-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-sm);
    min-height: 64px;
  }

  .hero-title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 0.95;
    margin: 0;
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

  .section-title {
    font-size: var(--text-sm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink-600);
    margin: 0 0 var(--space-md);
  }

  .section-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    margin-top: var(--space-md);
    font-size: var(--text-sm);
    color: var(--color-primary-500);
    text-decoration: none;
  }

  /* Blog posts */
  .post-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .post-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-md);
    padding: var(--space-sm) 0;
    border-bottom: 1px dashed var(--surface-color);
    text-decoration: none;
    color: inherit;
    transition: background-color var(--duration-fast) var(--ease-out-quart);
  }

  .post-row:hover {
    background-color: var(--surface-raised);
    padding-left: var(--space-sm);
    padding-right: var(--space-sm);
    margin-left: calc(-1 * var(--space-sm));
    margin-right: calc(-1 * var(--space-sm));
  }

  .post-title {
    font-weight: 600;
  }

  .post-date {
    font-size: var(--text-xs);
    color: var(--color-ink-600);
    white-space: nowrap;
    flex-shrink: 0;
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
  }

  .project-desc {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
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

  /* Publications */
  .pub-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .pub-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
    padding: var(--space-sm) 0;
    border-bottom: 1px dashed var(--surface-color);
    text-decoration: none;
    color: inherit;
    transition: background-color var(--duration-fast) var(--ease-out-quart);
  }

  .pub-row:hover {
    background-color: var(--surface-raised);
    padding-left: var(--space-sm);
    padding-right: var(--space-sm);
    margin-left: calc(-1 * var(--space-sm));
    margin-right: calc(-1 * var(--space-sm));
  }

  .pub-name {
    font-weight: 600;
    flex-shrink: 0;
  }

  .pub-desc {
    font-size: var(--text-sm);
    color: var(--color-ink-600);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

    .post-row {
      flex-direction: column;
      gap: var(--space-2xs);
    }

    .pub-row {
      flex-wrap: wrap;
    }

    .pub-desc {
      white-space: normal;
    }
  }
</style>
