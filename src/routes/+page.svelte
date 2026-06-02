<script lang="ts">
  import Now from '$lib/components/Now.svelte';
  import SiteHead from '$lib/components/SiteHead.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
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
  <section class="page-hd hero-hd">
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
        <Music size={14} strokeWidth={2} class="muted-icon" />
        <span class="status-text">{musicStatus.trackName} — {musicStatus.artists.map((a: any) => a.artistName).join(', ')}</span>
      </div>
    {/if}
  </div>

  <!-- Writing -->
  <section class="home-section">
    <h2 class="section-heading">{data.blog?.title ?? 'Blog'}</h2>
    {#if data.posts.length > 0}
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
    {:else}
      <EmptyState
        title="Blog unavailable"
        description="Unable to load blog posts at the moment. The publishing service may be temporarily unavailable. Please try again later."
      />
    {/if}
  </section>

  <!-- Projects -->
  <section class="home-section">
    <h2 class="section-heading">Projects</h2>
    {#if data.projects.length > 0}
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
    {:else}
      <EmptyState
        title="Projects unavailable"
        description="Unable to load project data at the moment. The service may be temporarily unavailable."
      />
    {/if}
  </section>

  <!-- Publications -->
  <section class="home-section">
    <h2 class="section-heading">Publications</h2>
    {#if data.publications.length > 0}
      <ul class="post-list">
        {#each data.publications as pub}
          <li>
            <a href={pub.url} target="_blank" rel="noopener" class="post-row">
              <span class="post-title">{pub.name}</span>
              <span class="row-meta">{pub.description}</span>
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <EmptyState
        title="Publications unavailable"
        description="Unable to load publications at the moment. Please try again later."
      />
    {/if}
  </section>

  <!-- Links -->
  <section class="home-section">
    <h2 class="section-heading">Elsewhere</h2>
    {#if data.links.length > 0}
      <div class="link-grid">
        {#each data.links as link}
          <a href={link.url} target="_blank" rel="noopener" class="link-chip">
            {#if link.emoji}
              <span class="link-emoji">{link.emoji}</span>
            {/if}
            <span class="link-text">{link.text}</span>
            <ExternalLink size={10} strokeWidth={2} class="muted-icon" />
          </a>
        {/each}
      </div>
    {:else}
      <EmptyState
        title="Links unavailable"
        description="Unable to load links at the moment. Please try again later."
      />
    {/if}
  </section>
</main>

